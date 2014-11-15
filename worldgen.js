var CityNamePre = ["Tai", "Nan", "Xiann", "Gan", "Xiam", "Chu", "Zhang", "Jang", "Jingx", "Gying", "Sheng",
           "Hang", "Shuang", "Quan", "Zaozhou", "Xian", "Ling", "Chan", "Taian", "Bin", "Fang",
           "Shan", "Jiang", "Put", "Chu", "Ye", "Hui", "Liao"];

function GeneratePlace()
{
	var Suffix = ["hou", "yi", "jinh", "ai", "shai", "gou", "gao", "lang", "mati", "kou"];
	var Prefix = CityNamePre.randomElement();
	return {
		Name: Prefix+Suffix.randomElement(),
		Prefix: Prefix,
		X   : RandInt(50, GameState.MapSizeX-50),
		Y   : RandInt(50, GameState.MapSizeY-50),
		Size: 10,
		Population: []
	};
}

function GenerateWorld()
{
	// -------
	// Terrain
	// -------
	iterations = 0;
	var scatterTerrain = function(amount, list)
	{
		for(var i = amount; i > 0; i--)
		{
			iterations+=1;
			if(iterations > 500)
				break;

			var element = list.randomElement();
			var terrain = {X: RandInt(50, GameState.MapSizeX-50), Y: RandInt(50, GameState.MapSizeY-50), W: element.W*2/3, H: element.H*2/3, Sprite: element};

			if(ProximityTestBoxBox(terrain, GameState.Map.Terrain)){ i++; continue; }

			GameState.Map.Terrain.push(terrain);
		}
	};
	scatterTerrain(20, Sprites.Mountain);
	scatterTerrain(40, Sprites.Forest);
	// ------
	// Cities
	// ------
	for(var i = 30; i > 0; i--)
	{
		var city = GeneratePlace();
		if(ProximityTestPointPoint(city, GameState.Map.Cities,  200)){ i++; continue; }
		if(ProximityTestPointPoint(city, GameState.Map.Terrain, 120)){ i++; continue; }
		GameState.Map.Cities.push(city);
	};
	// --------
	// Villages
	// --------
	for(var i = 45; i > 0; i--)
	{
		var village = RandomLocation();
		village.ParentCity = GameState.Map.Cities.sort(function(a, b){ return Distance(a, village) - Distance(b, village);})[0];
		if(ProximityTestPointPoint(village, GameState.Map.Cities,   100)){ i++; continue; }
		if(ProximityTestPointPoint(village, GameState.Map.Villages, 100)){ i++; continue; }
		if(ProximityTestPointPoint(village, GameState.Map.Terrain,  120)){ i++; continue; }
		GameState.Map.Villages.push(village);
	};
}

PrimaryColors   = [[74,238,129], [219,75,245], [255,62,34], [193,219,5], [81,217,235], [253,51,151], [48,112,253], [226,162,10], [45,126,2]];
SecondaryColors = [[151,39,137], [55,95,26], [167,28,14], [37,38,54], [61,79,179], [129,46,75], [117,71,16], [52,86,134], [65,36,88], [72,31,16], [26,82,92], [73,67,15], [132,31,29], [31,69,36], [121,36,98], [74,28,57], [108,57,133], [162,31,68], [112,67,107], [31,46,84], [63,73,142], [157,32,97], [83,21,33], [153,58,20], [118,59,38], [104,66,166], [134,54,60], [169,32,40], [75,78,110], [129,53,22]];

function GetDistinctColor()
{
	return DistinctColors.popRandom();
}

function RandomLocation()
{
	return {X: RandInt(0, GameState.MapSizeX), Y: RandInt(0, GameState.MapSizeY)};
}

function GeneratePoliticalLandscape()
{
	var families = GameState.Families.slice();
	var cities   = GameState.Map.Cities.slice();

	// Generate 15 Factions
	for(var i = 15; i >= 0; i--)
	{
		var family = families.popRandom();
		var city = cities.popRandom();
		var faction = {
			Name        : city.Prefix,
			Family      : family,
			Color       : SecondaryColors.popRandom(),
			Armies      : [],
			Center      : city,
			TownTexture : null,
			Cities      : [],
			SubFactions   : [],
			ParentFaction : null
		};
		family.Faction = faction;
		GameState.Factions.push(faction); 
	}

	// Each city is assigned to a faction
	GameState.Map.Cities.map(function(city)
	{
		var distances = GameState.Factions.map(function(faction)
		{
			return [faction, Distance(faction.Center, city)];
		});
		city.Faction = distances.sort(function(a, b){ return a[1]-b[1]; })[0][0];
		city.Faction.Cities.push(city);
	});

	// Determine the biggest 6 factions...
	var sortedFactions = GameState.Factions.sort(function(a, b){return b.Cities.length - a.Cities.length});
	var bigFactions = sortedFactions.slice(0, 5);
	var smallFactions = sortedFactions.slice(6);
	// Give the big factions more dominant colors.
	bigFactions.map(function(faction){
		faction.Color = PrimaryColors.popRandom();
	});
	// Assign the small faction to the big factions.
	smallFactions.map(function(smallFaction)
	{
		var distances = bigFactions.map(function(faction)
		{
			return [faction, Distance(faction.Center, smallFaction.Center)];
		});
		smallFaction.ParentFaction = distances.sort(function(a, b){ return a[1]-b[1]; })[0][0];
		smallFaction.ParentFaction.SubFactions.push(smallFaction);
	});
	// Tint town image for each faction.
	GameState.Factions.map(function(faction)
	{
		faction.TownTexture = RecolorImage(Assets["Cities"], faction.Color);
	});
}

function AssignHome()
{
	for(var i = 0; i < GameState.Characters.length; i++)
	{
		var person = GameState.Characters[i];
		if(person.Family.Faction)
		{
			var city = person.Family.Faction.Cities.randomElement();
			if(city.Population.length > 1)
				city = person.Family.Faction.Cities.randomElement();
		}
		else
		{
			var city = GameState.Map.Cities.randomElement();
			if(city.Population.length > 1)
				city = GameState.Map.Cities.randomElement();
		}

		person.Home = city;
		city.Population.push(person);
	};
}

function AssignFaction()
{
	for(var i = 0; i < GameState.Characters.length; i++)
	{
		var person = GameState.Characters[i];
		person.Faction = person.Home.Faction;
	}
}
"use strict";

function RandX()
{
	return RandInt(50, GameState.MapSizeX-50);
}

function RandY()
{
	return RandInt(50, GameState.MapSizeY-50);
}

function RandomLocation()
{
	return {X: RandX(), Y: RandY()};
}

function GeneratePlace()
{
	var city = new City();
	var prefix = Data.CityNamePrefixes.randomElement();
	var suffix = Data.CityNameSuffixes.randomElement();
	city.Name = prefix + suffix;
	city.X    = RandX();
	city.Y    = RandY();
	return city;
}

function GenerateWorld()
{
	// -------
	// Terrain
	// -------
	var iterations = 0;
	var scatterTerrain = function(amount, list)
	{
		for(var i = amount; i > 0; i--)
		{
			iterations+=1;
			if(iterations > 500)
				break;

			var element = list.randomElement();
			var terrain = {X: RandX(), Y: RandY(), W: element.W*2/3, H: element.H*2/3, Sprite: element};

			if(ProximityTestBoxBox(terrain, GameState.Map.Terrain)){ i++; continue; }

			GameState.Map.Terrain.push(terrain);
		}
	};
	scatterTerrain(20, Sprites.Mountain);
	scatterTerrain(40, Sprites.Forest);
	// ------
	// Cities
	// ------
	for(var j = 30; j > 0; j--)
	{
		var city = GeneratePlace();
		if(ProximityTestPointPoint(city, GameState.Map.Cities,  200)){ j++; continue; }
		if(ProximityTestPointPoint(city, GameState.Map.Terrain, 120)){ j++; continue; }
		GameState.Map.Cities.push(city);
	};
	// --------
	// Villages
	// --------
	for(var k = 45; k > 0; k--)
	{
		var village = RandomLocation();
		village.ParentCity = GameState.Map.Cities.sort(function(a, b){ return Distance(a, village) - Distance(b, village);})[0];
		if(ProximityTestPointPoint(village, GameState.Map.Cities,   100)){ k++; continue; }
		if(ProximityTestPointPoint(village, GameState.Map.Villages, 100)){ k++; continue; }
		if(ProximityTestPointPoint(village, GameState.Map.Terrain,  120)){ k++; continue; }
		GameState.Map.Villages.push(village);
	};
}

function GeneratePoliticalLandscape()
{
	var families = GameState.Families.slice();
	var cities   = GameState.Map.Cities.slice();

	var numFactions = 6;
	var numBigFactions = 6;

	// Generate Factions
	for(var i = numFactions; i > 0; i--)
	{
		var city = cities.popRandom();
		var faction = new Faction();
		faction.Name = Data.Faction.Names.popRandom();
		faction.Capital = city;
		city.setFaction(faction);
		city.Type = "capital";
		GameState.Factions.push(faction); 
	}

	// Each city is assigned to a faction
	GameState.Map.Cities.forEach(function(city)
	{
		var distances = GameState.Factions.map(function(faction)
		{
			return [faction, Distance(faction.Capital, city)];
		});
		var faction = distances.sort(function(a, b){ return a[1]-b[1]; })[0][0];
		city.setFaction(faction);
	});

	// Determine the biggest 6 factions...
	var sortedFactions = GameState.Factions.sort(function(a, b){return b.Cities.length - a.Cities.length});
	var bigFactions = sortedFactions.slice(0, numBigFactions);
	var smallFactions = sortedFactions.slice(numBigFactions);
	// Give the big factions more dominant colors.
	bigFactions.forEach(function(faction){
		faction.Color = Data.Faction.MajorColors.popRandom();
	});
	// Assign the small faction to the big factions.
	smallFactions.forEach(function(smallFaction)
	{
		var distances = bigFactions.map(function(faction)
		{
			return [faction, Distance(faction.Capital, smallFaction.Capital)];
		});
		var bigFaction = distances.sort(function(a, b){ return a[1]-b[1]; })[0][0];
		smallFaction.setParentFaction(bigFaction);
	});
	// Tint town image for each faction.
	GameState.Factions.forEach(function(faction)
	{
		faction.TownTexture = RecolorImage(Backend.Assets["Cities"], faction.Color);
	});
}

function DistributeRanks()
{
	GameState.Factions.forEach(
	function(faction)
	{
		if(faction.ParentFaction != null) return;
		faction.Ranks.forEach(
		function(rank)
		{
			//rank.cleanUp();
			var i = rank.Openings - rank.Assigned.length;
			if(i < 1)
				return;
			var population = GameState.Characters;
			population = population.filter(rank.canApply.bind(rank));
			population.forEach(function(e){e.calcScores();});
			population = population.mapMetadata(rank.calcScore.bind(rank), "_rscore");
			population = population.sort(function(a, b){ return a._rscore - b._rscore; });
			population.length = i;
			rank.assignTo(population);
		})
	});
}

function AssignHome()
{
	for(var i = 0; i < GameState.Characters.length; i++)
	{
		var person = GameState.Characters[i];
		var city = GameState.Map.Cities.randomElement();
		if(city.Population.length > 1)
			city = GameState.Map.Cities.randomElement();

		person.Home = city;
		city.Population.push(person);
	};
}

function FinishWorldGeneration()
{
	GameState.Map.Cities.forEach(DevelopCity);
}
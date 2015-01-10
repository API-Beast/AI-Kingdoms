"use strict";

var GameState =
	{ 
		MapSizeX: 2000, MapSizeY: 1500,
		Characters: [],
		SecondaryCharacters: [],
		Map: { Terrain: [], Cities: [], Villages: [] },
		Factions: [],
	  Families: [],
	  Year: 643,
	  Day: 0
	};

function GameInit()
{
	LoadImage("Assets/background.jpg", "BG");
	LoadImage("Assets/playerStructures.png", "Cities");
	LoadImage("Assets/mapElements.png", "Terrain");
}

function GameStart()
{
	var canvas = document.getElementById("map");
	canvas.width  = GameState.MapSizeX;
	canvas.height = GameState.MapSizeY;

	UpdateSize();
	window.onresize = UpdateSize;

  GenerateWorld();

  var genGeneration = function(oldGen)
  {
  	var newGen = GenerateOffspring(oldGen);
  	GameState.Characters = GameState.Characters.concat(newGen);
	  newGen.forEach(function(person, index)
		{
			DevelopCharacter(person, 0, 3);
		});
  	DistributeRanks();
 	  newGen.forEach(function(person, index)
		{
			DevelopCharacter(person);
		});
  	return newGen;
  };

	var gen1 = GenerateBaseGeneration(100);
	GameState.Characters = gen1;
	GeneratePoliticalLandscape();
	AssignHome();
  var gen2 = genGeneration(gen1);
  var gen3 = genGeneration(gen2);
  var gen4 = genGeneration(gen3);

	InitUI();
	UpdateUI();
	history.pushState(null, null);

	GameRedraw();
	setInterval(GameRedraw, 5000);
}

function GameRedraw()
{
	window.requestAnimationFrame(GameLoop);
}

function GameLoop()
{
	//window.requestAnimationFrame(GameLoop);
	// Only request new frames when needed

	var canvas = document.getElementById("map");
	var ctx = canvas.getContext("2d");

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = ctx.createPattern(Assets["BG"], 'repeat');
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.lineJoin = 'bevel';

	var map = GameState.Map;
	for(var i = map.Terrain.length - 1; i >= 0; i--)
	{
		var terrain = map.Terrain[i];
		var sprite  = terrain.Sprite;
		var x = terrain.X;
		var y = terrain.Y;

		var sx = sprite.X;
		var sy = sprite.Y;
		var sw = sprite.W;
		var sh = sprite.H;
		var dx = x - sw/2;
		var dy = y - sh/2;
		var dw = sw;
		var dh = sh;

		ctx.drawImage(Assets["Terrain"], sx, sy, sw, sh, dx, dy, dw, dh)
	};

	var drawStructure = function(src, struct, minor)
	{
		var faction = null;
		if(struct.hasOwnProperty("Faction")) 
		{
			faction = struct.Faction;
			while(Ui.MapMode == "realms" && faction.ParentFaction)
				faction = faction.ParentFaction;
		}
		else
		{
			faction = struct.ParentCity.Faction;
			while(Ui.MapMode == "realms" && faction.ParentFaction)
				faction = faction.ParentFaction;
		}

		ctx.drawImage(faction.TownTexture, src.X, src.Y, src.W, src.H, struct.X-src.W/2, struct.Y-src.H,  src.W, src.H);

		if(struct.hasOwnProperty("Name"))
		{
			ctx.save();
			ctx.font = '600 12pt Vollkorn';
			ctx.textAlign     = "center";
			ctx.fillStyle     = '#1b0b00';
			ctx.shadowBlur    = 2;
			ctx.shadowColor   = "white";
			ctx.shadowOffsetY = 1;

			if(!minor)
			{
				ctx.font = '14pt Lobster';
				ctx.fillStyle   = 'rgb('+faction.Color[0]+', '+faction.Color[1]+', '+faction.Color[2]+')';
				if(ColorIsDark(faction.Color))
				{
					ctx.strokeStyle = "white";
					ctx.shadowColor = "black";
				}
				else
					ctx.strokeStyle = "black";
				ctx.lineWidth   = 3;
				ctx.strokeText(struct.Name, struct.X, struct.Y+20);

				ctx.shadowBlur = null;
				ctx.shadowOffsetY = null;
				ctx.shadowColor = null;
			}

			ctx.fillText(struct.Name, struct.X, struct.Y+20);
			ctx.restore();
		}
	};
	GameState.Map.Cities.map
	(
		function(city)
		{
			if(city.Type == "city")
				drawStructure({X: 45, Y: 0, W: 53, H: 53}, city, true);
			else if(city.Type == "capital")
				drawStructure({X: 98, Y: 0, W: 87, H: 53}, city);
		}
	);
	GameState.Map.Villages.map(drawStructure.bind(undefined, {X:  0, Y: 0, W: 48, H: 53}));
}
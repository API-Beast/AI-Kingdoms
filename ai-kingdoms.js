var GameState =
	{ 
		MapSizeX: 2000, MapSizeY: 1500,
		Characters: [],
		SecondaryCharacters: [],
		Map: { Terrain: [], Cities: [], Villages: [] },
		Factions: [],
	  Families: [],
	};
var Sprites = {Mountain:[], Forest:[]};

function GameInit()
{
	LoadImage("Assets/background.jpg", "BG");
	LoadImage("Assets/playerStructures.png", "Cities");
	LoadImage("Assets/mapElements.png", "Terrain");

	Sprites.Mountain.push({X: 158, Y: 166, W: 200, H: 140, Type: "Mountain"});
	//Sprites.Mountain.push({X:  31, Y: 306, W: 200, H: 170, Type: "Mountain"});
	Sprites.Mountain.push({X:  27, Y: 313, W: 200, H: 165, Type: "Mountain"});
	Sprites.Mountain.push({X: 414, Y: 290, W: 125, H: 193, Type: "Mountain"});
	Sprites.Mountain.push({X: 230, Y: 310, W: 183, H: 155, Type: "Mountain"});
	Sprites.Mountain.push({X:  41, Y: 502, W: 170, H: 160, Type: "Mountain"});
	Sprites.Mountain.push({X: 282, Y: 683, W: 290, H:  85, Type: "Mountain"});

	Sprites.Forest.push({X: 579, Y: 631, W: 100, H: 100, Type: "Forest"});
	Sprites.Forest.push({X: 682, Y: 631, W: 100, H: 100, Type: "Forest"});
	Sprites.Forest.push({X: 784, Y: 631, W: 100, H: 100, Type: "Forest"});
	Sprites.Forest.push({X: 883, Y: 631, W: 100, H: 100, Type: "Forest"});
}

function GameStart()
{
	var canvas = document.getElementById("map");
	canvas.width  = GameState.MapSizeX;
	canvas.height = GameState.MapSizeY;

	UpdateSize();
	window.onresize = UpdateSize;

  GenerateWorld();

	var gen1 = GenerateBaseGeneration(150);
	var gen2 = GenerateOffspring(gen1);
	var gen3 = GenerateOffspring(gen2);
	var gen4 = GenerateOffspring(gen3);
	var allChars = GameState.Characters.concat(gen1, gen2, gen3, gen4);
	GameState.Characters          = allChars.filter(function(person){ return  person.hasOwnProperty("Traits"); });
	GameState.SecondaryCharacters = allChars.filter(function(person){ return !person.hasOwnProperty("Traits"); });

	GeneratePoliticalLandscape();
	AssignHome();
	AssignFaction();

	InitUI();
	UpdateUI();
	history.pushState(null, null);

	GameRedraw();
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

	var drawStructure = function(src, struct)
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
			ctx.font = '12pt Lobster';
			ctx.textAlign     = "center";
			ctx.fillStyle     = 'black';
			ctx.shadowBlur    = 2;
			ctx.shadowColor   = "white";
			ctx.shadowOffsetY = 1;

			if(true)
			{
				ctx.fillStyle   = 'rgb('+faction.Color[0]+', '+faction.Color[1]+', '+faction.Color[2]+')';
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
	GameState.Map.Cities  .map(drawStructure.bind(undefined, {X: 98, Y: 0, W: 87, H: 53}));
	GameState.Map.Villages.map(drawStructure.bind(undefined, {X:  0, Y: 0, W: 48, H: 53}));

	var radius = Math.min(canvas.width, canvas.height)/2;
	var gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, radius*2);
	gradient.addColorStop(0,   "rgba(0,0,0, 0.0)");
	gradient.addColorStop(0.2, "rgba(0,0,0, 0.0)");
	gradient.addColorStop(0.5, "rgba(0,0,0, 0.1)");
	gradient.addColorStop(0.7, "rgba(0,0,0, 0.2)");
	gradient.addColorStop(0.9, "rgba(0,0,0, 0.4)");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}
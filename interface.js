var Ui = {
	ShowObject      : false,
	CurrentObject   : null,
	MapMode         : "realms"
};

function UpdateSize()
{
	var sidebar = document.getElementById("sidebar-content");
	sidebar.style["max-height"] = window.innerHeight+"px";
}

function DisplayObject(obj)
{
	Ui.ShowObject = true;
	Ui.CurrentObject = obj;
	UpdateUI();
	history.pushState(Ui, null);
}

function SetMapMode(mode)
{
	Ui.MapMode = mode;
	history.pushState(Ui, null);
	GameRedraw();
}

function CreateSymbol(symbol)
{
	var span = document.createElement('span');
	span.className = "symbol "+symbol;
	return span;
}

function CreateLinkFor(obj)
{
	var	element = null;
	var isCharacter = obj.hasOwnProperty("Gender");
	var isCity = obj.hasOwnProperty("Population");
	var isFaction = obj.hasOwnProperty("Cities");
	// Character
	if((isCharacter && obj.hasOwnProperty("Traits")) || !isCharacter)
	{
		element = document.createElement('a');
		element.className = "objectLink";

		var onClick = DisplayObject.bind(undefined, obj);
		element.addEventListener('click', onClick);
	}
	else
	{
		element = document.createElement('span');
		element.className = "objectLink unimportant";
	}

	if(isCharacter)
		element.innerHTML = obj.Surname+' '+obj.Name;
	else
		element.innerHTML = obj.Name;

	if(isCharacter && !obj.Alive)
		element.appendChild(CreateSymbol("dead"));
	element.appendChild(CreateSymbol(obj.Gender));
	if(obj.Rank)
		element.appendChild(CreateSymbol(obj.Rank));
	if(isCity)
		element.appendChild(CreateSymbol("city"));

	if(isFaction)
	{
		element.style.color = "rgb("+obj.Color[0]+", "+obj.Color[1]+", "+obj.Color[2]+")";
		element.className += " faction"; 
	}
	
	return element;
}

function CreateTag(obj)
{
	var div = document.createElement('div');
	div.className = 'tag';
	if(typeof(obj) == 'object')
		dic.appendChild(CreateLinkFor(obj));
	else
		div.innerHTML = obj;
	return div;
}

function CreateDoubleTag(text, obj)
{
	var div = document.createElement('div');
	div.className = 'double-tag';
	var spanA = document.createElement('span');
	var spanB = document.createElement('span');
	spanA.innerHTML = text;
	spanB.appendChild(CreateLinkFor(obj));
	div.appendChild(spanA);
	div.appendChild(spanB);
	return div;
}

function OnBack(e)
{
	if(e.state)
		Ui = e.state;
	else
	{
		Ui.ShowObject = false;
		Ui.CurrentObject = null;
		Ui.MapMode = 'realms';
	}
	UpdateUI();
	window.requestAnimationFrame(GameLoop);
}
window.onpopstate = OnBack;

function OnClick(click)
{
	var map = document.getElementById("playfield");
	var pos = {X: click.clientX, Y: click.clientY};
	var mapPos = {X: map.offsetLeft, Y: map.offsetTop};
	var scrollPos = { X: map.scrollLeft, Y: map.scrollTop };
	pos = Vec2Add(pos, Vec2Neg(mapPos));
	pos = Vec2Add(pos, scrollPos);
	var city = ProximityTestPointPoint(pos, GameState.Map.Cities, 50);
	console.log(pos);
	if(city)
		DisplayObject(city);
}

function InitUI()
{
	var controls = document.getElementById("controls");
	controls.innerHTML = "";

	var symbol = CreateSymbol("Strength");
	symbol.addEventListener('click', SetMapMode.bind(undefined, 'realms'));
	controls.appendChild(symbol);

	var symbol = CreateSymbol("Tactic");
	symbol.addEventListener('click', SetMapMode.bind(undefined, 'factions'));
	controls.appendChild(symbol);

	var map = document.getElementById("map");
	map.addEventListener("click", OnClick);
}

function UpdateUI()
{
	var sidebar = document.getElementById("sidebar-content");
	sidebar.innerHTML = "";
	if(Ui.ShowObject)
	{
		var obj = Ui.CurrentObject;
		var isCharacter = obj.hasOwnProperty("Gender");
		var isCity = obj.hasOwnProperty("Population");

		var faction = null;
		faction = obj.Faction;
		while(Ui.MapMode == "realms" && faction.ParentFaction)
			faction = faction.ParentFaction;

		var section = document.createElement('div');
		section.className = "section ribbon";
		section.style.backgroundColor = "rgb("+faction.Color[0]+", "+faction.Color[1]+", "+faction.Color[2]+")";

		var title = document.createElement('div');
		if(isCharacter)
			title.innerHTML = obj.Surname+' '+obj.Name;
		else
			title.innerHTML = obj.Name;
		title.className = "title";
		section.appendChild(title);
		sidebar.appendChild(section);

		if(isCharacter)
		{
			var subtitle = document.createElement('span');
			subtitle.innerHTML = obj.Rank+', '+obj.Age;
			subtitle.className = "subtitle";

			if(!obj.Alive)
				subtitle.appendChild(CreateSymbol("dead"));
			subtitle.appendChild(CreateSymbol(obj.Gender));

			section.appendChild(subtitle);

			var misc = document.createElement('div');
			misc.className = "section misc";
			misc.appendChild(CreateDoubleTag("Home", obj.Home));
			misc.appendChild(CreateDoubleTag("Faction", obj.Faction));
			sidebar.appendChild(misc);


			var statsTable = HtmlTableFromArray([[CreateSymbol("Strength"), CreateSymbol("Tactic"), CreateSymbol("Charisma"), CreateSymbol("Intrigue"), CreateSymbol("Willpower")], obj.Stats]);
			statsTable.className = "section stats";
			sidebar.appendChild(statsTable);

			var traits = document.createElement('div');
			traits.className = "section traits";
			for(var i = 0; i < obj.Traits.length; i++)
			{
				var trait = obj.Traits[i];
				traits.appendChild(CreateTag(trait));
			};
			sidebar.appendChild(traits);

			var relations = document.createElement('div');
			relations.className = "section relations";
			for(var i = 0; i < obj.Relations.length; i++)
			{
				var rel = obj.Relations[i];
				relations.appendChild(CreateDoubleTag(rel[0], rel[1]));
			};
			sidebar.appendChild(relations);
		}
		else if(isCity)
		{
			var population = document.createElement('div');
			population.className = "section population";
			obj.Population.map(
			function(person){
				if(!(person.Alive)) return;
				var div = document.createElement('div');
				div.className = 'tag';
				div.appendChild(CreateLinkFor(person));
				population.appendChild(div);
			}
			);
			sidebar.appendChild(population);
		}

	}
	else
	{
		var ul = document.createElement("ul");
		var CreateListFor = function(fac)
		{
			var id = "listFaction" + fac.Name;
			var container = document.createElement("li");
			var label     = document.createElement("label");
			label.innerHTML = fac.Name;
			label.htmlFor   = id;
			var input     = document.createElement("input");
			input.type = "checkbox";
			input.id   = id;
			var list = document.createElement("ul");
			GameState.Characters.map(function(person){
				if(!person.Alive) return;
				if(person.Faction == fac)
				{
					var item = document.createElement("li");
					item.appendChild(CreateLinkFor(person));
					list.appendChild(item);
				}
			});
			fac.SubFactions.map(function(subfaction){
				list.appendChild(CreateListFor(subfaction));
			});
			container.appendChild(label);
			container.appendChild(input);
			container.appendChild(list);
			return container;
		};

		GameState.Factions.map(function(faction)
		{
			if(!faction.ParentFaction)
				ul.appendChild(CreateListFor(faction));
		});
		sidebar.appendChild(ul);
	}
}
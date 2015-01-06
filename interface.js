"use strict";

var Ui = {
	ShowObject      : false,
	CurrentObject   : null,
	MapMode         : "realms"
};

function UpdateSize()
{
	var elements = document.querySelectorAll("#sidebar section");
	for (var i = 0; i < elements.length; i++)
		elements[i].style["height"] = window.innerHeight-20+"px";
	var objInfo = document.getElementById("object-info");
	objInfo.style["height"] = window.innerHeight-30+"px";
}

function DisplayObject(obj, noScroll)
{
	Ui.ShowObject = true;
	Ui.CurrentObject = obj;
	SetActiveTab(document.getElementById("object-info-tab"));
	UpdateUI();
	
	if(!noScroll)
	{
		if(obj.hasOwnProperty("X"))
		{
			var w = playfield.clientWidth;
			var h = playfield.clientHeight;
			playfield.scrollLeft = obj.X - w/2;
			playfield.scrollTop  = obj.Y - h/2;
		}
	}

	try
	{
		history.pushState(Ui, null);
	}
	catch(e)
	{
	}
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
	var	div = null;
	var name;

	var isCharacter = obj instanceof Character;
	var isCity      = obj instanceof City;
	var isFaction   = obj instanceof Faction;

	div = document.createElement('div');
	div.className = "objectLink";

	name = obj.Name;

	if(isCharacter)
	{
		name = obj.Surname+' '+obj.Name;
		var addPlaceholder = true;

		if(!obj.IsAlive)
		{
			div.appendChild(CreateSymbol("dead"));
			addPlaceholder = false;
		}
		if(obj.Rank.Icon)
		{
			div.appendChild(CreateSymbol(obj.Rank.Icon));
			addPlaceholder = false
		}

		if(addPlaceholder)
			div.appendChild(CreateSymbol("empty"));

		div.appendChild(CreateSymbol(obj.Gender));
	}

	if(isFaction)
	{
		div.style.color = "rgb("+obj.Color[0]+", "+obj.Color[1]+", "+obj.Color[2]+")";
		div.className += " faction"; 
		if(ColorIsDark(obj.Color))
			div.className += " dark"; 
	}

	if(isCity)
	{
		var symb = CreateSymbol("solid-color");
		symb.style.backgroundColor = "rgb("+obj.Faction.Color[0]+", "+obj.Faction.Color[1]+", "+obj.Faction.Color[2]+")";
		div.appendChild(symb);
	}

	var link = document.createElement('a');
	link.appendChild(document.createTextNode(name));
	link.className = "name";
	var onClick = DisplayObject.bind(undefined, obj, false);
	div.addEventListener('click', onClick);
	div.appendChild(link);

	return div;
}

function CreateTag(obj, symbol)
{
	var div = document.createElement('div');
	div.className = 'tag';
	if(typeof(obj) == 'object')
	{
		if(obj instanceof City || obj instanceof Faction || obj instanceof Character)
		{
			div.appendChild(CreateLinkFor(obj));
		}
		else
		{
			var skill = Skills[obj.Name];
			var tooltip = skill.Effect.getDescription(obj.Level);
			tooltip = "<b>"+obj.Name+" "+obj.Level+"</b>\n"+tooltip;
			SetTooltip(div, tooltip);
			div.appendChild(CreateSymbol("level-"+Math.floor(obj.Level)));
			div.appendChild(document.createTextNode(obj.Name));
		}
	}
	else
	{
		if(symbol)
			div.appendChild(CreateSymbol(symbol));
		div.appendChild(document.createTextNode(obj));
	}
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
	if(city)
		DisplayObject(city, true);
}

function SetActiveTab(tab)
{
	var parent = tab.parentNode;
	var elements = parent.querySelectorAll("section");
	for(var i = 0; i < elements.length; i++)
	{
		elements[i].className = "";
	}
	tab.className = "active-tab";
}

function InitUI()
{
	var elements = document.querySelectorAll(".tabbed section h2 a");
	for (var i = 0; i < elements.length; i++)
		elements[i].addEventListener("click", SetActiveTab.bind(undefined, elements[i].parentNode.parentNode));

	/*var controls = document.getElementById("controls");
	controls.innerHTML = "";

	var symbol = CreateSymbol("Strength");
	symbol.addEventListener('click', SetMapMode.bind(undefined, 'realms'));
	controls.appendChild(symbol);

	var symbol = CreateSymbol("Tactics");
	symbol.addEventListener('click', SetMapMode.bind(undefined, 'factions'));
	controls.appendChild(symbol);*/

	var map = document.getElementById("map");
	map.addEventListener("click", OnClick);
}

function UpdateUI()
{
	var objInfo = document.getElementById("object-info");
	objInfo.innerHTML = "";
	if(Ui.ShowObject)
	{
		var obj = Ui.CurrentObject;
		var isCharacter = obj instanceof Character;
		var isCity      = obj instanceof City;
		var isFaction   = obj instanceof Faction;

		var faction = null;
		if(isFaction)
			faction = obj;
		else if(isCharacter)
		{
			faction = obj.Rank.Faction;
			if(!faction)
				faction = obj.Home.Faction;
		}
		else if(isCity)
			faction = obj.Faction;

		var ribbon = document.createElement('div');
		ribbon.className = "section ribbon";
		ribbon.style.backgroundColor = "rgb("+faction.Color[0]+", "+faction.Color[1]+", "+faction.Color[2]+")";
		if(ColorIsDark(faction.Color)) ribbon.className += " dark";

		var title = document.createElement('div');
		if(isCharacter)
			title.innerHTML = obj.Surname+' '+obj.Name;
		else
			title.innerHTML = obj.Name;
		title.className = "title";
		ribbon.appendChild(title);
		objInfo.appendChild(ribbon);

		if(isCharacter)
		{
			var subtitle = document.createElement('span');
			subtitle.innerHTML = obj.Rank.Name+', '+obj.Age;
			subtitle.className = "subtitle";

			if(!obj.IsAlive)
				subtitle.appendChild(CreateSymbol("dead"));
			subtitle.appendChild(CreateSymbol(obj.Gender));

			ribbon.appendChild(subtitle);

			var stats = document.createElement('div');

			stats.className = "section stats";
			var exposedAttrbs = ["Strength", "Tactics", "Charisma", "Intrigue"];
			var symbols    = exposedAttrbs.map(function(e){ return CreateSymbol(e);        });
			var data       = exposedAttrbs.map(function(e){ return obj.Attributes[e] || 0; });
			var attributes = HtmlTableFromArray([symbols, data]);
			attributes.className = "attributes";
			stats.appendChild(attributes);

			for(var i = 0; i < obj.Traits.length; i++)
			{
				var trait = obj.Traits[i];
				var tag = CreateTag(trait, Traits[trait].Icon);
				var tooltip = Traits[trait].Effect.getDescription(1);
				tooltip = "<b>"+trait+"</b>\n"+tooltip;
				SetTooltip(tag, tooltip);
				stats.appendChild(tag);
			};

			objInfo.appendChild(stats);

			var misc = document.createElement('div');
			misc.className = "section misc";
			if(obj.Home)          misc.appendChild(CreateDoubleTag("Home",          obj.Home));
			if(obj.Faction)       misc.appendChild(CreateDoubleTag("Faction",       obj.Faction));
			objInfo.appendChild(misc);

			var skills = document.createElement('div');
			skills.className = "section skills";
			for(var i = 0; i < obj.Skills.length; i++)
			{
				var skill = obj.Skills[i];
				var tag = CreateTag(skill);
				skills.appendChild(tag);
			};
			objInfo.appendChild(skills);

			var relations = document.createElement('div');
			relations.className = "section relations";
			for(var i = 0; i < obj.Relations.length; i++)
			{
				var rel = obj.Relations[i];
				relations.appendChild(CreateDoubleTag(rel.Type, rel.Subject));
			};
			objInfo.appendChild(relations);
		}
		else if(isCity)
		{
			var misc = document.createElement('div');
			misc.className = "section misc";
			if(obj.Faction)  misc.appendChild(CreateDoubleTag("Controlled by", obj.Faction));
			if(obj.Governor) misc.appendChild(CreateDoubleTag("Governor",      obj.Governor));
			objInfo.appendChild(misc);

			var population = document.createElement('div');
			population.className = "section population";
			obj.Population.map(
			function(person){
				if(!(person.IsAlive)) return;
				if(!(person.isRelevant())) return;
				population.appendChild(CreateTag(person));
			}
			);
			objInfo.appendChild(population);
		}
		else if(isFaction)
		{
			var misc = document.createElement('div');
			misc.className = "section misc";
			if(obj.ParentFaction) misc.appendChild(CreateDoubleTag("Controlled by", obj.ParentFaction));
			if(obj.Capital)       misc.appendChild(CreateDoubleTag("Capital",       obj.Capital));
			if(obj.Leader)        misc.appendChild(CreateDoubleTag("Leader",        obj.Leader));
			objInfo.appendChild(misc);

			var subs = document.createElement('div');
			subs.className = "section subs";
			obj.SubFactions.map(function(faction){ subs.appendChild(CreateTag(faction)); });
			objInfo.appendChild(subs);

			var cities = document.createElement('div');
			cities.className = "section cities";
			obj.Cities.map(
			function(city){
				cities.appendChild(CreateTag(city));
			}
			);
			objInfo.appendChild(cities);

			var members = document.createElement('div');
			members.className = "section members";
			GameState.Characters.forEach(
			function(person){
				if(!(person.IsAlive)) return;
				if(person.Rank.Faction != obj) return;
				members.appendChild(CreateTag(person));
			}
			);
			objInfo.appendChild(members);
		}

	}
	else
	{
		GameState.Factions.map(function(faction)
		{
			if(!faction.ParentFaction)
				objInfo.appendChild(CreateTag(faction));
		});
	}
}
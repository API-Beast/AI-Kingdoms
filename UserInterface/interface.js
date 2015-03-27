"use strict";

var Interface = {
	ShowObject   : false,
	CurrentObject: null,
	MapMode      : "realms",
	TimeSpeed    : 1,
	SearchBar    : null
};

function UpdateSize()
{
	var elements = document.querySelectorAll("#sidebar section");
	for (var i = 0; i < elements.length; i++)
		elements[i].style["height"] = window.innerHeight-60+"px";
	var objInfo = document.getElementById("object-info");
	objInfo.style["height"] = window.innerHeight-70+"px";
}

function DisplayObject(obj, noScroll)
{
	Interface.ShowObject = true;
	Interface.CurrentObject = obj;
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
		history.pushState(Interface, null);
	}
	catch(e)
	{
	}
}

function SetMapMode(mode)
{
	Interface.MapMode = mode;
	history.pushState(Interface, null);
	GameRedraw();
}

function OnBack(e)
{
	if(e.state)
		Interface = e.state;
	else
	{
		Interface.ShowObject = false;
		Interface.CurrentObject = null;
		Interface.MapMode = 'realms';
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

	var map = document.getElementById("map");
	map.addEventListener("click", OnClick);

	var search = document.getElementById("object-searchbar");
	search.addEventListener('input', function() { OnSearchInput(this.value); });
	/*Interface.SearchBar = completely(search, {});
	Interface.SearchBar.onChange = OnSearchInput;
	Interface.SearchBar.options  = ["Talented", "Warrior"];*/
}

function OnSearchInput(text)
{
	var sep = ' ';
	if(text.lastIndexOf(',') != -1) sep = ',';

	/*Interface.SearchBar.startFrom = text.lastIndexOf(sep)+1;
	Interface.SearchBar.repaint();*/

	var words = text.split(sep);
	var results = [];
	var objMatch = ObjectMatchesSearch.bind(undefined, words);
	results = GameState.Characters.filter(objMatch);
	results = results.concat(GameState.Map.Cities.filter(objMatch));

	var div = document.getElementById("object-search-results");
	div.innerHTML = "";
	for (var i = 0; i < results.length; i++)
		div.appendChild(UI.Tag(UI.Link(results[i])));
}

function ObjectMatchesSearch(search, obj)
{
	for(var i = 0; i < search.length; i++)
	{
		var word  = search[i];
		var found = false;
		for(var j = 0; j < obj.Searchable.length; j++)
		{
			var prop = obj[obj.Searchable[j]];
			if(PropertyMatchesWord(word, prop))
			{
				found = true;
				break;
			}
		};
		// A word was not found... exit.
		if(!found) return false;
	};
	return true;
}

function PropertyMatchesWord(word, prop)
{
	word = word.toLowerCase();
	if(prop instanceof TraitList) return prop.search(word)       !== null;
	if(prop instanceof Rank)      return prop.Name.toLowerCase().indexOf(word) === 0;
	return prop.toLowerCase().indexOf(word) === 0;
}

function UpdateResourceUI()
{
	var div  = document.querySelector("#overview .time");
	div.innerHTML = Data.Months[GameState.Month-1] + " <span class='date'>" + Align(2, GameState.Day, "0")+"."+Align(2, GameState.Month, "0")+"."+Align(3, GameState.Year, "0")+"</span>";
}

function UpdateUI()
{
	var objInfo = document.getElementById("object-info");
	objInfo.innerHTML = "";

	var AddUI = function(e){objInfo.appendChild(e);};
	if(Interface.ShowObject)
	{
		var obj = Interface.CurrentObject;
		// ==========
		// Characters
		// ==========
		if(obj instanceof Character)
		{
			var faction = obj.Rank.Faction;
			if(!faction)
				faction = obj.Home.Faction;

			var subtitle = [UI.Text(obj.Rank.Name+', '+obj.Age)];
			if(!obj.IsAlive) subtitle.push(UI.Symbol("dead"));
			subtitle.push(UI.Symbol(obj.Gender));

			AddUI(UI.Ribbon(faction.Color, UI.Text(obj.Surname+' '+obj.Name), subtitle));
		}
		// ======
		// Cities
		// ======
		else if(obj instanceof City)
		{
			AddUI(UI.Ribbon(obj.Faction.Color, UI.Text(obj.Name)));

			var misc = [];
			if(obj.Faction)  misc.push(UI.DoubleTag("Controlled by", UI.Link(obj.Faction)));
			if(obj.Governor) misc.push(UI.DoubleTag("Governor",      UI.Link(obj.Governor)));
			AddUI(UI.Div(misc, "section misc"));
			
			AddUI(UI.LinkList(obj.Population, "section population", function(p){ return p.IsAlive && p.isRelevant(); }));
		}
		// ========
		// Factions
		// ========
		else if(obj instanceof Faction)
		{
			AddUI(UI.Ribbon(obj.Color, UI.Text(obj.Name)));

			var misc = [];
			if(obj.ParentFaction) misc.push(UI.DoubleTag("Controlled by", UI.Link(obj.ParentFaction)));
			if(obj.Capital)       misc.push(UI.DoubleTag("Capital",       UI.Link(obj.Capital)));
			if(obj.Leader)        misc.push(UI.DoubleTag("Leader",        UI.Link(obj.Leader)));
			AddUI(UI.Div(misc, "section misc"));

			AddUI(UI.LinkList(obj.SubFactions, "section subs"));
			AddUI(UI.LinkList(obj.Cities, "section cities"));
			AddUI(UI.LinkList(GameState.Characters, "section members", function(p){ return p.IsAlive && person.Rank.Faction == obj; }));
		}

		// Generic for all: Properties
		if(obj.Properties)
		{
			var div = UI.Div(undefined, "section properties");
			AddUI(div);
			for (var i = 0; i < obj.Properties.length; i++)
			{
				var key = obj.Properties[i];
				var prop = obj[key];
				if(prop instanceof AttributeList)
				{
					var table = [];
					for(var attr in prop.Static)
					{
						if(prop.Static.hasOwnProperty(attr))
						{
							var meta = Data.Attributes[attr];
							if(meta && meta.Display === "Icon")
							{
								table.push([[UI.Symbol(attr)], prop.Static[attr]]);
							}
						}
					}
					UI.Append(div, UI.Table(table, key));
				}
				else if(prop instanceof TraitList)
				{
					var traits = [];
					prop.Data.forEach(function(o)
					{
						var display = [];
						if(o.Trait.Icon)
							display.push(UI.Symbol(o.Trait.Icon));
						if(o.Level && o.Level > 0)
							display.push(UI.Symbol("level-"+o.Level));

						display.push(o.Trait.Name);

						var tag = UI.Tag(display);
						SetTooltip(tag, o.Trait.getDescription(o.Level));
						traits.push(tag);
					});
					UI.Append(div, UI.Div(traits, "list "+key));
				}
				else
					UI.Append(div, UI.DoubleTag(key, UI.Link(prop)));
			};
		}

	}
	else
	//
	// No object displayed, proceed with listing the factions
	//
	{
		AddUI(UI.LinkList(GameState.Factions, "section factions"));
	}

	// Make sure all list items are semi-aligned into a grid.
	var listItems = document.querySelectorAll(".list div");
	var gridSize = 25;
	for(var i = 0; i < listItems.length; i++)
	{
		var item = listItems[i];
		var style = getComputedStyle(item);
		var margin = parseInt(style.marginLeft) + parseInt(style.marginRight);
		var width  = ((Math.floor((item.offsetWidth-1)/gridSize)+1)*gridSize - margin);
		item.style.width = width+"px";
	}

	UpdateResourceUI();
}
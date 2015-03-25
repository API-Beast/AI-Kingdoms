"use strict";

var Ui = {
	ShowObject   : false,
	CurrentObject: null,
	MapMode      : "realms",
	TimeSpeed    : 1
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

	var map = document.getElementById("map");
	map.addEventListener("click", OnClick);
}

function UpdateResourceUI()
{
	var div  = document.querySelector("#overview .time");
	div.innerHTML = Data.Months[GameState.Month-1] + " <span class='date'>" + Align(2, GameState.Day, "0")+"."+Align(2, GameState.Month, "0")+"."+Align(3, GameState.Year, "0")+"</span>";
}

function MakeObjView(data)
{
	var objInfo = document.getElementById("object-info");
	objInfo.innerHTML = "";

	var curSection = objInfo;
	var curElement = objInfo;

	for(var i = 0; i < Data.length; i++)
	switch(Data[i].Type)
	{
		case "Ribbon":


			objInfo.appendChild(ribbon);
			curSection = ribbon;
			break;
		case "Text":
			var div = document.createElement('div');
			var text = document.createTextNode(Data[i].Text);
			div.className = Data[i].Class;
			curSection.appendChild(div);
			curElement = div;
			break;
		case "Icon":
			var icon = CreateSymbol(Data[i].Name);
			curElement.appendChild(icon);
			break;
		case "Link":
			var div = CreateTag(Data[i].Obj);
			curSection.appendChild(div);
			curElement = div;
			break;
		case "Double Tag":
			var div = CreateDoubleTag(Data[i].Label, Data[i].Obj);
			curSection.appendChild(div);
			curElement = div;
			break;
	}

}

function UpdateUI()
{
	var objInfo = document.getElementById("object-info");
	objInfo.innerHTML = "";

	var AddUI = function(e){objInfo.appendChild(e);};
	if(Ui.ShowObject)
	{
		var obj = Ui.CurrentObject;
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
					var table = [[], []];
					for(var attr in prop.Static)
					{
						if(prop.Static.hasOwnProperty(attr))
						{
							var meta = Data.Attributes[attr];
							if(meta && meta.Display === "Icon")
							{
								table[0].push(UI.Symbol(attr));
								table[1].push(UI.Text(Math.floor(prop.Static[attr])));
							}
						}
					}
					UI.Append(div, UI.Table(table, "table "+key));
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
	UpdateResourceUI();
}
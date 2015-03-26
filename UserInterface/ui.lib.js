
var UI = {};

UI.Append = function(parent, children)
{
	if(Array.isArray(children))
	{
		for(var i = 0; i < children.length; i++)
			UI.Append(parent, children[i]);
	}
	else if(typeof children === "string")
		parent.appendChild(UI.Text(children));
	else if(typeof children === "number")
		parent.appendChild(UI.Number(children));
	else if(children instanceof Node)
		parent.appendChild(children);
	else if(children === undefined);
	else
		parent.appendChild(UI.Link(children));
};

UI.Text = function(text)
{
	return document.createTextNode(text);
}

UI.Number = function(num)
{
	var text = "";
	if(Math.abs(num) > 1000)
		text = (num/1000).toFixed(1)+"k";
	else 
		text = Math.floor(num);
	return UI.Text(text);
}

UI.Symbol = function(symbol)
{
	var span = document.createElement('span');
	span.className = "symbol "+symbol;
	return span;
}

UI.Div = function(content, cssClass)
{
	var div = document.createElement('div');
	UI.Append(div, content);
	div.className = cssClass;
	return div;
};

UI.Link = function(obj)
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
			div.appendChild(UI.Symbol("dead"));
			addPlaceholder = false;
		}
		if(obj.Rank.Icon)
		{
			div.appendChild(UI.Symbol(obj.Rank.Icon));
			addPlaceholder = false
		}

		if(addPlaceholder)
			div.appendChild(UI.Symbol("empty"));

		div.appendChild(UI.Symbol(obj.Gender));
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
		var symb = UI.Symbol("solid-color");
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

UI.Tag = function(content)
{
	var div = document.createElement('div');
	div.className = 'tag';
	UI.Append(div, content);
	return div;
}

UI.DoubleTag = function(label, value)
{
	var div = document.createElement('div');
	div.className = 'double-tag';
	var spanA = document.createElement('span');
	var spanB = document.createElement('span');
	UI.Append(spanA, label);
	UI.Append(spanB, value);
	div.appendChild(spanA);
	div.appendChild(spanB);
	return div;
}

UI.Ribbon = function(color, title, subtitle)
{
	var ribbon = document.createElement('div');
	ribbon.style.backgroundColor = "rgb("+color[0]+", "+color[1]+", "+color[2]+")";
	ribbon.className = "section ribbon";
	if(ColorIsDark(color))
		ribbon.className += " dark";

	if(title)    ribbon.appendChild(UI.Div(title,    "title"));
	if(subtitle) ribbon.appendChild(UI.Div(subtitle, "subtitle"));

	return ribbon;
}

UI.LinkList = function(list, cssClass, filter)
{
	var result = [];
	if(!filter)
		filter = function(){ return true; };

	var addIf = function(obj)
	{
		if(filter(obj))
			result.push(UI.Tag(UI.Link(obj)));
	};

	list.forEach(addIf);

	var div = document.createElement('div');
	UI.Append(div, result);
	div.className = cssClass;
	return div;
}

UI.Table = function(array, cssClass)
{
	var table = document.createElement('table');
	for (var i = 0; i < array.length; i++)
	{
		var subarray = array[i];
		var row = table.insertRow();
		for(var j = 0; j < subarray.length; j++)
		{
			var cell = row.insertCell();
			UI.Append(cell, subarray[j]);
		};
	};
	table.className = cssClass;
	return table;
}
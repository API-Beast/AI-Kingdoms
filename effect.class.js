"use strict";

var Effect = function(template)
{
	this.Attributes   = [];
	this.EnableEvents = [];
	this.Condition    = [];
	this.LevelFactor  = [0, 1, 2, 4, 6, 10];
	this.Likes        = [];
	this.Dislikes     = [];

	if(template)
	for(var key in template)
	if(template.hasOwnProperty(key))
		this[key] = template[key];
}

Effect.prototype.apply = function(level, attr, extraEvents)
{
	if(this.Attributes)
	for(var i = 0; i < this.Attributes.length; i+=2)
	{
		var name = this.Attributes[i];
		var bonus = this.Attributes[i+1] * this.LevelFactor[level];
		attr[name] += bonus;
	};
	if(this.EnableEvents)
	for(var i = 0; i < this.EnableEvents.length; i++)
	{
		var key = this.EnableEvents[i];
		if(!extraEvents.hasOwnProperty(key))
			extraEvents[key]  = level;
		else
			extraEvents[key] += level;
	}
};

Effect.prototype.conditionsFulfilled = function(level, attr, situation)
{
	return this.isStatic(); /*TODO*/
};

Effect.prototype.isStatic = function()
{
	return this.Condition.length == 0;
};

Effect.prototype.getDescription = function(level)
{
	var result = "";
	var intend = "";
	if(this.Condition.length > 0)
	{
		result  = "<b>While ";
		for (var i = 0; i < this.Condition.length; i++)
		{
			var val = this.Condition[i];
			var mod = "And";

			if(i === 0)
				mod = undefined;
			
			if(typeof val === "object")
			{
				mod = val[0];
				val = val[1];

				if(mod == "Not")
				{
					if(i === 0)
						mod = "not";
					else
						mod = "And not"
				}
			}

			if(mod)
				result += mod + " <i>" + val + "</i>";
			else
				result += val;

			if(i != (this.Condition.length-1))
				result += "\n  ";
		}
		result += ":</b>\n";
		intend = "  ";
	}
	if(this.Attributes)
	for(var i = 0; i < this.Attributes.length; i+=2)
	{
		var name = this.Attributes[i];
		var bonus = this.Attributes[i+1] * this.LevelFactor[level];
		if(bonus > 0)
			result += intend+"+"+bonus+" "+name+"\n";
		else
			result += intend+bonus+" "+name+"\n";
	};
	if(this.EnableEvents)
	for(var i = 0; i < this.EnableEvents.length; i++)
	{
		result += intend+"Enables <i>"+this.EnableEvents[i]+"</i> Events\n";
	}
	if(this.Likes.length)    result += "Likes Characters with <i>"+this.Likes.join("</i> or <i>")+"</i>\n";
	if(this.Dislikes.length) result += "Dislikes Characters with <i>"+this.Dislikes.join("</i> or <i>")+"</i>\n";
	return result;
};
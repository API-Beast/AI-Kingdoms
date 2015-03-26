"use strict";

var Effect = function(template)
{
	this.Attributes   = [];
	this.AttrMult     = [];
	this.AddTag       = [];
	this.Description  = "";
	this.Condition    = [];
	this.LevelFactor  = [1, 1, 2, 4, 6, 10];
	this.Likes        = [];
	this.Dislikes     = [];

	ApplyTemplate(this, template);
}

Effect.prototype.apply = function(level, attr, charTags, attrMult)
{
	if(attr)
	for(var i = 0; i < this.Attributes.length; i+=2)
	{
		var name = this.Attributes[i];
		var bonus = this.Attributes[i+1];
		if(typeof bonus === "object")
			bonus = bonus[level];
		else
			bonus = bonus * this.LevelFactor[level];
		if(!attr.hasOwnProperty(name))
			attr[name]  = bonus
		else
		  attr[name] += bonus;
	};
	if(attrMult)
	for(var i = 0; i < this.AttrMult.length; i+=2)
	{
		var name = this.AttrMult[i];
		var mult = this.AttrMult[i+1] * this.LevelFactor[level];
		if(!attrMult.hasOwnProperty(name))
			attrMult[name]  = 1.0 + mult;
		else
		  attrMult[name] += mult;
	};
	if(charTags)
	for(var i = 0; i < this.AddTag.length; i++)
	{
		var key = this.AddTag[i];
		if(!charTags.hasOwnProperty(key))
			charTags[key]  = level;
		else
			charTags[key] += level;
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

Effect.prototype.getPermanence = function()
{
	if(this.isStatic()) return "Static";
	return "Dynamic";
}

Effect.prototype.getDescription = function(level)
{
	var result = "";
	var intend = "";
	if(this.Description)
	{
		if(typeof this.Description === "string")
			result += "<span class='meta'>"+ this.Description + "</span>\n";
		else
			result += "<span class='meta'>"+ this.Description[0].replace("{1}", this.Description[1][level-1]) + "</span>\n";
	}
	for(var i = 0; i < this.AddTag.length; i++)
	{
		result += intend+"Enables <i>"+this.AddTag[i]+"</i> Events\n";
	}
	if(this.AddTag.length)
		result += ""
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
	for(var i = 0; i < this.Attributes.length; i+=2)
	{
		var name = this.Attributes[i];
		var bonus = this.Attributes[i+1];
		if(typeof bonus === "object")
			bonus = bonus[level];
		else
			bonus = bonus * this.LevelFactor[level];

		if(bonus != 0)
		{
			if(bonus > 0)
				result += intend+"+"+bonus+" "+name+"\n";
			else
				result += intend+bonus+" "+name+"\n";
		}
	}
	for(var i = 0; i < this.AttrMult.length; i+=2)
	{
		var name = this.AttrMult[i];
		var mult = this.AttrMult[i+1];
		if(typeof mult === "object")
			mult = mult[level];
		else
			mult = mult * this.LevelFactor[level];

		if(mult != 0)
		{
			if(mult > 0)
				result += intend+"+"+(mult*100).toFixed(0)+"% "+name+"\n";
			else
				result += intend+(mult*100).toFixed(0)+"% "+name+"\n";
		}
	}

	if(this.Likes.length)    result += "Likes Characters with <i>"+this.Likes.join("</i> or <i>")+"</i>\n";
	if(this.Dislikes.length) result += "Dislikes Characters with <i>"+this.Dislikes.join("</i> or <i>")+"</i>\n";

	return result;
};
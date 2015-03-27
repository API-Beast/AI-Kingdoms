"use strict";

var Trait = function(template)
{
	this.Name = "_MISSING_NAME_";
	this.PreReq = { Attributes:[] };
	this.Exclusive = [];
	this.IsTrait   = false;
	this.Weight    = 1;
	this.Icon      = null;
	this.Effects   = [];
	this.Tags      = [];

	ApplyTemplate(this, template);

	for(var i = 0; i < this.Effects.length; i++)
		this.Effects[i] = new Effect(this.Effects[i]);
};

Trait.prototype.getDescription = function(level)
{
	var desc = [];
	for(var i = 0; i < this.Effects.length; i++)
		desc.push(this.Effects[i].getDescription(level));

	return desc.join("\n");
};

Trait.prototype.preReqFulfilled = function(entity)
{
	for(var key in this.PreReq)
	{
		if(!this.PreReq.hasOwnProperty(key))
		if(!entity.hasOwnProperty(key))
			continue;

		if(entity[key] instanceof AttributeList)
		for(var i = 0; i < this.PreReq[key].length; i+=2)
		{
			var attrib   = this.PreReq[key][i];
			var minLevel = this.PreReq[key][i+1];
			if(entity[key].get(attrib) < minLevel)
				return false;
		}

		if(entity[key] instanceof TraitList)
		for(var i = 0; i < this.PreReq[key].length; i++)
		{
			var temp     = this.PreReq[key][i];
			var skill    = temp;
			var minLevel = 0;
			var mod      = "And";

			if(typeof temp === "object") // ["Not", "Generous"]
			{
				if(temp.length === 2)
				{
					if(typeof(temp[1]) === "number")
					{
						skill    = temp[0];
						minLevel = temp[1];
					}
					else
					{
						mod      = temp[0];
						skill    = temp[1];
					}
				}
				else
				{
					mod      = temp[0];
					skill    = temp[1];
					minLevel = temp[2];
				}
			}

			var s = entity[key].get(skill);
			var result = true;

			if(!s)
				result = false
			else if(s.Level < minLevel)
				result = false;

			if(mod === "Not")
				result = !result;

			if(!result)
				return false;
		};
	}
	
	return true;
};
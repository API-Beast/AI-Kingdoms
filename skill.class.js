"use strict";

var Skill = function(name, tag, template)
{
	this.Name = name;
	this.PreReq = { Attributes:[], Skills:[], Traits:[] };
	this.Exclusive = [];
	this.IsTrait   = false;
	this.Weight    = 1;
	this.Icon      = null;

	this.Effect = new Effect();
	if(typeof tag === "object")
		this.Tags = tag;
	else
		this.Tags = [tag];

	ApplyTemplateMultiple(this, template, this.Effect);
};

Skill.prototype.preReqFulfilled = function(person)
{
	if(this.PreReq.Attributes)
	for(var i = 0; i < this.PreReq.Attributes.length; i+=2)
	{
		var attrib   = this.PreReq.Attributes[i];
		var minLevel = this.PreReq.Attributes[i+1];
		if(person.Attributes[attrib] < minLevel)
			return false;
	};

	//var lastResult = false;
	if(this.PreReq.Skills)
	for(var i = 0; i < this.PreReq.Skills.length; i+=2)
	{
		var skill    = this.PreReq.Skills[i];
		var minLevel = this.PreReq.Skills[i+1];
		var mod      = "And";

		if(typeof skill === "object") // ["Not", "Generous"]
		{
			mod   = skill[0];
			skill = skill[1];
		}

		var s = person.getSkill(skill);
		var result = true;

		if(s)
		{
			if(s.Level < minLevel)
				result = false;
		}
		else
			result = false;

		if(mod === "Not") result = !result;
		//if(mod === "Or")  result = result || lastResult;

		if(!result) return false;

		//lastResult = result;
	};

	//var lastResult = false;
	if(this.PreReq.Traits)
	for(var i = 0; i < this.PreReq.Traits.length; i++)
	{
		var trait  = this.PreReq.Traits[i];
		var mod    = "And";

		if(typeof trait === "object") // ["Not", "Generous"]
		{
			mod   = trait[0];
			trait = trait[1];
		}

		var result = person.hasTrait(trait);

		if(mod === "Not") result = !result;
		//if(mod === "Or")  result = result || lastResult;

		if(!result) return false;

		//lastResult = result;
	};

	for (var i = 0; i < this.Exclusive.length; i++)
	{
		var name = this.Exclusive[i];
		if(this.IsTrait)
		{
			if(person.hasTrait(name))
				return false;
		}
		else
		{
			if(person.getSkill(name))
				return false;
		}
	};
	
	return true;
};
"use strict";

var Skill = function(name, tag, template)
{
	this.Name = name;
	this.PreReq = { Attributes:[], Skills:[], Traits:[] };

	this.Effect = new Effect();
	if(typeof tag === "object")
		this.Tags = tag;
	else
		this.Tags = [tag];

	if(template)
	for(var key in template)
	if(template.hasOwnProperty(key))
	{
		if(this.Effect.hasOwnProperty(key))
			this.Effect[key] = template[key];
		else
			this[key] = template[key];
	}
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
	if(this.PreReq.Skills)
	for(var i = 0; i < this.PreReq.Skills.length; i+=2)
	{
		var skill    = this.PreReq.Skills[i];
		var minLevel = this.PreReq.Skills[i+1];
		var s = person.getSkill(skill);
		if(!s)
			return false;
		if(s.Level < minLevel)
			return false;
	};
	if(this.PreReq.Traits)
	for(var i = 0; i < this.PreReq.Traits.length; i++)
	{
		var trait = this.PreReq.Traits[i];
		if(!person.hasTrait(trait))
			return false;
	};
	return true;
};
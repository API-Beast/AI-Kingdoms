"use strict";

var TraitList = function()
{
	this.Data = []; // {Trait: object, Level: 0}
	Object.defineProperty(this, "length", {get: function(){return this.Data.length;}});
}

TraitList.prototype.add = function(trait, level)
{
	var existing = this.get(trait.Name, null);
  if(existing === null)
  	this.Data.push({Trait: trait, Level: level || 0});
  else if(existing.Trait != trait)
  {
  	existing.Trait = trait;
  	existing.Level = level || 0;
  }
  else if(level)
	  existing.Level = Math.max(level, existing.Level);
};

TraitList.prototype.get = function(name, level)
{
	for(var i = 0; i < this.Data.length; i++)
	{
		if(this.Data[i].Trait.Name === name || this.Data[i].Trait === name)
		if((!level) || this.Data[i].Level >= level)
			return this.Data[i];
	};
	return null;
};

TraitList.prototype.applyEffects = function(permanence, attrList, tags)
{
	var mult = {};
	var attr = attrList[permanence];

	//attrList["reset"+permanence]();

	for(var i = 0; i < this.Data.length; i++)
	for (var j = 0; j < this.Data[i].Trait.Effects.length; j++)
	{
		var effect = this.Data[i].Trait.Effects[j];
		if(effect.getPermanence() === permanence)
			effect.apply(this.Data[i].Level, attr, tags, mult);
	};

	for(var a in mult)
	{
		if(mult.hasOwnProperty(a))
		if(attr.hasOwnProperty(a))
			attr[a] = Math.floor(attr[a] * mult[a]);
	}
};
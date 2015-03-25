"use strict";

var City = function()
{
	this.Name = '???';
	this.X    = 0;
	this.Y    = 0;
	this.Type = "city";
	this.Population = [];
	this.Faction    = null;
	
	this.Traits     = new TraitList();
	this.Attributes = new AttributeList();

	this.BaseTags       = [];
	this.Tags           = ShallowCopy(this.BaseTags);

	this.Properties = [["Attributes"], ["Traits"]];
};

City.prototype.getFaction = function()
{
	var faction = this.Faction;
	while(faction.ParentFaction) faction = faction.ParentFaction;
	return faction;
};

City.prototype.setFaction = function(newFaction)
{
	if(this.Faction)
		this.Faction.Cities.removeElement(this);
	this.Faction = newFaction;
	newFaction.Cities.push(this);
};

City.prototype.hasTrait = function(name)
{
	return this.Traits.contains(name);
};

City.prototype.giveTrait = function(name)
{
	console.assert(Traits.hasOwnProperty(name) === true, "Trait " + name + " doesn't exist!");
	this.Traits.push(name);
}
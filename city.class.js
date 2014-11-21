"use strict";

var City = function()
{
	this.Name = '???';
	this.X    = 0;
	this.Y    = 0;
	this.Type = "city";
	this.Population = [];
	this.Faction    = null;
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
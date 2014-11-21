"use strict";

var Faction = function()
{
	this.Name    = "???";
	this.Color   = Data.Faction.MinorColors.popRandom();
	this.Armies  = [];
	this.Capital = null;
	this.TownTexture = null;
	this.Cities = [];
	this.SubFactions = [];
	this.ParentFaction = null;
};

Faction.prototype.setParentFaction = function(faction)
{
	if(this.ParentFaction)
		this.ParentFaction.SubFactions.removeElement(this);
	this.ParentFaction = faction;
	faction.SubFactions.push(this);
};

Faction.prototype.getControlledCities = function(faction)
{
	var subFactionCityLists = this.SubFactions.map(function(x){ return x.Cities; });
	return Array.prototype.concat.apply(this.Cities, subFactionCityLists);
};
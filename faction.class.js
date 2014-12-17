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
	this.Ranks = [];
	// TODO
	this.Ranks.push(new Rank("Leader", this, {
		Openings: 1,
		Scoring: { Stats: [0.1, 0.1, 0.1, 0.1, 0.1], Prestige: 1, Relations: 1, Heritage: 2 },
		Score: 12
	}));
	this.Ranks.push(new Rank("General", this, {
		Openings: 4,
		Scoring: { Stats: [0.25, 1.0, 0.1, 0.1, 0.1], Prestige: 2, Relations: 0.2, Heritage: 0.2 },
		Score:  6,
		PreviousRank: "Commander",
		Ratio: 0.25 // For every 4 commanders, 1 General at most
	}));
	this.Ranks.push(new Rank("Commander", this, {
		Openings: 12,
		Scoring: { Stats: [0.50, 1.0, 0.1, 0.1, 0.1], Prestige: 1, Relations: 0.2, Heritage: 0.2 },
		Score:  2,
		PreviousRank: "Soldier",
		Ratio: 0.10 // For ever 10 soldiers, 1 Commander at most
	}));
	this.Ranks.push(new Rank("Chancellor", this, {
		Openings: 2,
		Scoring: { Stats: [0.0, 0.5, 1.0, 1.0, 0.0], Prestige: 1.5, Relations: 1.0, Heritage: 0.2 }
	}));
	this.Ranks.push(new Rank("Advisor", this, {
		Openings: 8,
		Scoring: { Stats: [0.0, 0.5, 1.0, 1.0, 0.5], Prestige: 1.0, Relations: 0.5, Heritage: 0.2 }
	}));
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
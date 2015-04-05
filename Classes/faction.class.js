"use strict";

var Faction = function()
{
	this.Name    = "???";
	this.Color   = [255, 255, 255];
	this.Armies  = [];
	this.Capital = null;
	this.TownTexture = null;
	this.Cities = [];
	this.SubFactions = [];
	this.ParentFaction = null;
	this.Ranks = [];
	this.Ranks["Leader"] = new Rank("Leader", this, {
		Icon: "Leader",
		Openings: 1,
		Scoring: { Prestige: 1, Relations: 1, Heritage: 2 },
		SkillMod: [["Inspiration", +5]],
		Score: 12
	});
	this.Ranks["General"] = new Rank("General", this, {
		Icon: "General",
		Openings: 2,
		Scoring: { Strength: 0.25, Tactics: 2, Prestige: 2, Relations: 0.2, Heritage: 0.2 },
		SkillMod: [["Inspiration", +5], ["Intimidation", +5]],
		TraitMod: [["Pacifist", -25]],
		Score:  6,
		PreviousRank: "Commander"
	});
	this.Ranks["Commander"] = new Rank("Commander", this, {
		Icon: "Commander",
		Openings: 6,
		Scoring: { Strength: 0.25, Tactics: 1, Prestige: 1, Relations: 0.2, Heritage: 0.2 },
		TraitMod: [["Pacifist", -25]],
		Score:  2,
		PreviousRank: "Soldier"
	});
	this.Ranks["Chancellor"] = new Rank("Chancellor", this, {
		Icon: "Chancellor",
		Openings: 2,
		Scoring: { Intrigue: 1, Charisma: 1, Prestige: 1.0, Relations: 2.0, Heritage: 0.5 },
		SkillMod: [["Shemer", +5], ["Socializer", +3], ["Scholar", +3]],
		TraitMod: [["Pacifist", -10]],
		Score: 6
	});
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
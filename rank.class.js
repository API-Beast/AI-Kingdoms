"use strict";

var Rank = function(name, faction, template)
{
	this.Assigned = [];
	this.Name     = name;
	this.Faction  = faction;
	this.Score    = 0;

	if(template)
		for(var key in template)
			if(template.hasOwnProperty(key))
				this[key] = template[key];
};

Rank.prototype.cleanUp = function()
{
	this.Assigned = this.Assigned.filter(function(p){ return p.IsAlive && p.Rank == this; });
};

Rank.prototype.assignTo = function(person)
{
	if(Array.isArray(person))
	{
		var that = this;
		person.forEach(function(pers)
		{
			that.assignTo(pers);
		});
		return;
	}

	if(person.Rank == undefined)
		throw new TypeError("Argument 1: Doesn't have Rank property.");

	if(person.Rank)
		person.Rank.Assigned.removeElement(person);
	person.Rank = this;
	this.Assigned.push(person);
	return;
};

Rank.prototype.calcScore = function(person)
{
	var score = 0;
	score += person.Stats.reduce(function(prevValue, stat, index){ return prevValue + stat * this.Scoring.Stats[index]; }.bind(this), 0);
	for(var key in person.Scores)
	{
		if(person.Scores.hasOwnProperty(key) && this.Scoring.hasOwnProperty(key))
			score += person.Scores[key] * this.Scoring[key];
	}
	if(this.SkillModifier)
	{
		this.SkillModifier.forEach(function(e)
		{
			var s = person.getSkill(e[0]);
			if(s)
				score += s.Level * e[1];
		});
	}
	if(this.TraitModifier)
	{
		this.TraitModifier.forEach(function(e)
		{
			if(person.hasTrait(e[0]))
				score += e[1];
		});
	}
	return score;
};

Rank.prototype.canApply = function(person)
{
	var result = person.IsAlive && person.isPartOfFaction(this.Faction) && person.isRelevant();
	if(this.PreviousRank) result = result && person.Rank.Name == this.PreviousRank;
	if(person.Rank != this.PreviousRank) result = result && person.Rank.Score < this.Score;
	return result;
};
"use strict";

var Character = function()
{
	this.Name    = "???";
	this.Gender  = "unknown";
	this.Surname = "???";

	this.FatherFamily = null;
	this.MotherFamily = null;
	this.Age          = 0;
	this.Development  = 0;
	this.Health       = RandBellCurve(40, 80);
	this.IsAlive      = true;
	this.Stats        = [0, 0, 0, 0, 0];

	// Attributes = BaseAttributes + Modification through static traits and skills
	this.Attributes = new AttributeList();
	this.Attributes.Base = {"Strength":0, "Tactics":0, "Intrigue":0, "Charisma":0};
	this.Attributes.setBase("Health", RandBellCurve(40, 80));
	this.Attributes.setBase("Learning", 2);
	this.Attributes.setBase("Skill Diversity", 3);
	this.Attributes.setBase("Income", 1);

	this.Tags = [];

	this.Skills       = new TraitList();
	this.Traits       = new TraitList();

	this.Score        = -1;
	this.Scores       = { Rank: -1, Prestige: 0, Heritage: 0, Relations: 0};
	this.Feats        = []; // {Description: "", Score: 0}

	this.Rank         = new Rank("Commoner", null);
	this.MinorRanks   = []; // {Name: "", Faction: null, Score: 0}

	this.Relations      = []; // {Type: "", Subject: null}
	this.MinorRelations = [];

	this.Properties = [["Attributes"], ["Home"], ["Skills"], ["Traits"]];

	this.Home = null;
};

Character.CreateToken = function(familyA, familyB, age, gender)
{
	TypeCheck(arguments, ["object", "object", "number", "string"]);
	var person = new Character();
	if(gender === "male")
		person.Name = RandomMaleName();
	else
		person.Name = RandomFemaleName();

	person.Surname      = familyA.Name;
	person.Gender       = gender;
	person.FatherFamily = familyA;
	person.MotherFamily = familyB;
	person.Age          = age;
	person.IsAlive      = age < person.Health;
	return person;
}

Character.prototype.isRelevant = function()
{
	return this.Development != 0;
};

Character.prototype.calcAttributes = function()
{
	this.Attributes.resetStatic();
	this.Traits.applyEffects("Static", this.Attributes, this.Tags);
	this.Skills.applyEffects("Static", this.Attributes, this.Tags);

	this.Attributes.resetDynamic();
	this.Traits.applyEffects("Dynamic", this.Attributes, this.Tags);
	this.Skills.applyEffects("Dynamic", this.Attributes, this.Tags);
};

Character.prototype.calcScores = function()
{
	var that = this;
	 // A score less than 0 means "completly irrelevant"
	this.Scores.Rank = this.Rank.Score;

	this.Scores.Prestige = 0;
	this.Feats.forEach(function(feat, index)
	{
		that.Scores.Prestige += feat.Score;
	});

	// Add scores from minor ranks
	this.MinorRanks.forEach(function(rank, index)
	{
		that.Score.Prestige += rank.Score;
	});
	// Being related to influential people raises the score somewhat
	this.Relations.forEach(function(relation, index)
	{
		if(["Father", "Brother", "Mother", "Sister"].contains(relation.Type))
		{
			that.Scores.Heritage += Math.round(relation.Subject.Score / 4);
			if(relation.Subject.Rank.Name === "Leader" && relation.Subject.Faction === that.Home.Faction)
				that.Scores.Heritage += 6;
		}
		else
			that.Scores.Relations += Math.floor(relation.Subject.Score / 8); // Round down to avoid feedback loop
	});

	this.Score = 0;
	this.Score += this.Scores.Rank;
	this.Score += this.Scores.Prestige;
	if(this.IsAlive) // Don't add Heritage and Relation scores to dead characters to avoid score inflation.
	{
		this.Score += this.Scores.Heritage;
		this.Score += this.Scores.Relations;
	}
};

Character.prototype.getRelationTo = function(to)
{
	var result = [];
	var findPersonAndAppend = function(element)
	{
		if(element.Subject === to)
			result.push(element.Type);
	};
	this.     Relations.forEach(findPersonAndAppend);
	this.MinorRelations.forEach(findPersonAndAppend);
	return result;
};

Character.prototype.getRelations = function(type)
{
	var result = [];
	var findPersonAndAppend = function(element)
	{
		if(element.Type === type)
			result.push(element.Subject);
	};
	this.     Relations.forEach(findPersonAndAppend);
	this.MinorRelations.forEach(findPersonAndAppend);
	return result;
}

Character.prototype.hasRelation = function(type)
{
	var result = [];
	for (var i = 0; i < this.Relations.length; i++)
	{
		if(this.Relations[i].Type === type) return true;
	};
	for (var j = 0; j < this.MinorRelations.length; j++)
	{
		if(this.MinorRelations[j].Type === type) return true;
	};
	return false;
}

Character.prototype.addRelation = function(type, subject)
{
	TypeCheck(arguments, ["string", "object"]);
	var relationList = this.Relations;
	if(["Respects", "Hates"].contains(type))
		relationList = this.MinorRelations;

	var entry = {Type: type, Subject: subject};

	var foundRelation = false;
	relationList.forEach(function(element, index)
	{
		if(element.Type === type && element.Subject === subject)
		{
			entry = element;
			foundRelation = true;
		}
	});

	if(!foundRelation)
		relationList.push(entry);
	return entry;
};

Character.prototype.setHome = function(newHome)
{
	TypeCheck(arguments, ["object"]);
	if(this.Home)
		this.Home.Population.removeElement(this);
	this.Home = newHome;
	newHome.Population.push(this);
}

Character.prototype.makeChoice = function(area, choices)
{
	return choices.randomElement();
}

Character.prototype.isPartOfFaction = function(of)
{
	if(this.Home)
	{
		var faction = this.Home.Faction;
		while(true)
		{
			if(faction == of)
				return true;
			if(!faction.ParentFaction)
				return false;
			faction = faction.ParentFaction;
		}
	}
	return false;
}
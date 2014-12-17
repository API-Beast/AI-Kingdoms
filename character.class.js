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
	this.Skills       = []; // {Name: "", Level: 0}
	this.Traits       = [];
	this.Score        = -1;
	this.Scores       = { Rank: -1, Prestige: 0, Heritage: 0, Relations: 0};
	this.Feats        = []; // {Description: "", Score: 0}

	this.Rank         = new Rank("Commoner", null);
	this.MinorRanks   = []; // {Name: "", Faction: null, Score: 0}

	this.Relations      = []; // {Type: "", Subject: null}
	this.MinorRelations = [];

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

Character.prototype.calculateScore = function()
{
	 // A score less than 0 means "completly irrelevant"
	this.Scores.Rank = this.Rank.Score;

	this.Scores.Prestige = 0;
	this.Feats.forEach(function(feat, index)
	{
		this.Scores.Prestige += feat.Score;
	});

	// Add scores from minor ranks
	this.MinorRanks.forEach(function(rank, index)
	{
		this.Score.Prestige += rank.Score;
	});
	// Being related to influential people raises the score somewhat
	this.Relations.forEach(function(relation, index)
	{
		if(["Father", "Brother", "Mother", "Sister"].contains(relation.Type))
		{
			this.Scores.Heritage += Math.floor(relation.Subject.Score / 4);
			if(relation.Subject.Rank.Name === "Leader" && relation.Subject.Faction === this.Home.Faction)
				this.Scores.Heritage += 6;
		}
		else
			this.Scores.Relations += Math.floor(relation.Subject.Score / 8); // Round down to avoid feedback loop
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

Character.prototype.hasTrait = function(name)
{
	return this.Traits.contains(name);
};

Character.prototype.giveTrait = function(name)
{
	if(!this.hasTrait(name))
		this.Traits.push(name);
}

Character.prototype.getSkill = function(name)
{
	for(var i = 0; i < this.Skills.length; i++)
	{
		if(this.Skills[i].Name === name)
			return this.Skills[i];
	}
	return null;
}

Character.prototype.giveSkill = function(name, level)
{
	TypeCheck(arguments, ["string", "number"]);
	for(var i = 0; i < this.Skills.length; i++)
	{
		var skill = this.Skills[i];
		if(skill.Name === name)
		{
			skill.Level = Math.max(level, skill.Level);
			return skill;
		}
	}
	var skill = {Name: name, Level: level};
	this.Skills.push(skill);
	return skill;
}

Character.prototype.trainSkill = function(name, amount, maxLevel)
{
	TypeCheck(arguments, ["string", "number", "number"]);
	for(var i = 0; i < this.Skills.length; i++)
	{
		var skill = this.Skills[i];
		if(skill.Name === name)
		{
			skill.Level = Math.min(skill.Level+amount, Math.max(maxLevel, skill.Level));
			return skill;
		}
	}
	var skill = {Name: name, Level: amount};
	this.Skills.push(skill);
	return skill;
}

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
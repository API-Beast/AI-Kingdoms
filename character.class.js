"use strict";

var Character = function()
{
	this.Name    = "???";
	this.Gender  = "unknown";
	this.Surname = "???";

	this.FatherFamily = null;
	this.MotherFamily = null;
	this.Age          = 0;
	this.Health       = RandBellCurve(40, 80);
	this.IsAlive      = true;
	this.Stats        = [0, 0, 0, 0, 0];
	this.Traits       = []; // {Name: "", Level: 0}
	this.IsComplete   = false;
	this.Score        = -1;
	this.Feats        = []; // {Description: "", Score: 0}

	this.Rank         = { Name: "Commoner", Faction: null, Score: 0 };
	this.MinorRanks   = []; // {Name: "", Faction: null, Score: 0}

	this.Relations      = []; // {Type: "", Subject: null}
	this.MinorRelations = [];

	this.Home = null;
};

Character.CreateToken = function(familyA, familyB, age, gender)
{
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
	return this.isComplete && this.Score > -1;
};

Character.prototype.calculateScore = function()
{
	this.Score  = -1; // A score less than 0 means "completly irrelevant"
	this.Score += this.Rank.Score;
	this.Feats.forEach(function(feat, index)
	{
		this.score += feat.Score;
	});
	if(!this.IsAlive)
	{
		; // A dead man is only recognized for his primary rank and his feats, but not for his relations.
	}
	else
	{
		// Add scores from minor ranks
		this.MinorRanks.forEach(function(rank, index)
		{
			this.Score += rank.Score;
		});
		// Being related to influential people raises the score somewhat
		this.Relations.forEach(function(relation, index)
		{
			if(["Father", "Brother", "Mother", "Sister"].contains(relation.Type))
				this.Score += Math.floor(relation.Subject.Score / 4);
			else
				this.Score += Math.floor(relation.Subject.Score / 8);
		});
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
			result.push(element.subject);
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
	for(var i = 0; i < this.Traits.length; i++)
	{
		if(this.Traits[i].Name === name)
			return this.Traits[i].Level || 1;
	}
	return false;
}

Character.prototype.setHome = function(newHome)
{
	if(this.Home)
		this.Home.Population.removeElement(this);
	this.Home = newHome;
	newHome.Population.push(this);
}
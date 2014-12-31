"use strict";

GameState.Families = [];

var FamilyNames = ["Li","Wang","Zhang","Liu","Chen","Yang","Zhao","Huang",
               "Zhou","Wu","Xu","Sun","Hu","Zhu","Gao","Lin","He","Guo",
               "Ma","Luo","Liang","Song","Zheng","Xie","Han","Tang",
               "Feng","Yu","Dong","Xiao","Cheng","Cao","Yuan","Deng","Xu",
               "Fu","Shen","Zeng","Peng","Lu","Su","Lu","Jiang","Cai","Jia",
               "Ding","Wei","Xue","Ye","Yan","Yu","Pan","Du","Dai","Xia",
               "Zhong","Wang","Tian","Ren","Jiang","Fan","Fang","Shi","Yao",
               "Tan","Sheng","Zou","Xiong","Jin","Lu","Hao","Kong","Bai","Cui",
               "Kang","Mao","Qiu","Qin","Jiang","Shi","Gu","Hou","Shao","Meng",
               "Long","Wan","Duan","Zhang","Qian","Tang","Yin","Li","Yi","Chang",
               "Wu","Qiao","He","Lai","Gong","Wen"];
for (var i = 40; i >= 0; i--)
{
	GameState.Families.push({
		Name: FamilyNames.popRandom(),
		Traits: [],
		Stats: [RandInt(-1, 3), RandInt(-1, 3), RandInt(-1, 3), RandInt(-1, 3), RandInt(-1, 3)],
		Faction: null});
}

function GenerateBaseGeneration(numPeople)
{
	var result = [];
	for (var i = 0; i < numPeople; i++)
	{
		var familyA = GameState.Families.randomElement();
		var familyB = GameState.Families.randomElement();

		var person = Character.CreateToken(familyA, familyB, RandInt(60, 80), ["male", "female"].randomElement());
		var father = Character.CreateToken(familyA, GameState.Families.randomElement(), person.Age + RandInt(16, 50), "male");
		var mother = Character.CreateToken(familyB, GameState.Families.randomElement(), person.Age + RandInt(15, 30), "female");
		person.Relations.push(["Father", father]);
		person.Relations.push(["Mother", mother]);

		//result.push(father);
		//result.push(mother);
		result.push(person);
	};
	return result;
}

function GiveBaseBaseAttributes(person)
{
	person.Stats = person.Affinity;
	person.Development = 0;
}

function DevelopCharacter(person, minState, maxState)
{
	var talented = person.hasTrait("Talented") + person.hasTrait("Genius")*2;
	var incapable = person.hasTrait("Incapable");
	var atr = person.BaseAttributes;

	var distributeSkills = function(skills)
	{
		var i = 2 + talented - incapable;
		var onlyTrain = person.Skills.length > (3 + talented - incapable);
		skills = skills.filter(function(skill)
		{ 
			var s = person.getSkill(skill[0]);
			var minLevel =  skill[2];
			var maxLevel = (skill[1] || 1);
			if(!s)
				return (minLevel == undefined) && !onlyTrain;
			if(minLevel && s.Level < minLevel)
				return false;
			if(s.Level > maxLevel)
				return false;
			return true;
		});
		while(i && skills.length)
		{
			var skill = skills.popRandom();
			person.trainSkill(skill[0], 1, skill[1]||1);
			i -= 1;
		}
	};
	var distributeSkillsByTag = function(tags, maxLevel)
	{
		var skills;
		// Depends on the attributes so recalculate them.
		person.calcAttributes();
		if(typeof tags === 'object')
			skills = SkillsArray.filter(function(skill){ return skill.Tags.some(function(t){ return tags.contains(t); }); });
		else
			skills = SkillsArray.filter(function(skill){ return skill.Tags.contains(tags); });
		skills = skills.filter(function(skill){ return skill.preReqFulfilled(person); });
		skills = skills.map(function(skill){ return [skill.Name, maxLevel]; });
		distributeSkills(skills);
	};
	var advanceCareer = function()
	{
		switch(person.Rank.Name)
		{
			case "General":
				distributeSkillsByTag(["Fighter", "Tactican", "Personality"], 5);
				atr.Strength += RandInt(0, 2);
				atr.Tactic   += RandInt(0, 2);
				break;
			case "Commander":
				distributeSkillsByTag(["Fighter", "Tactican"], 4);
				atr.Strength += RandInt(0, 2);
				atr.Tactic   += RandInt(0, 2);
				break;
			case "Soldier":
				distributeSkillsByTag("Fighter", 4);
				atr.Strength += RandInt(0, 2);
				atr.Tactic   += RandInt(0, 2);
				break;
			case "Leader":
				distributeSkillsByTag(["Politican", "Personality"], 5);
				atr.Intrigue += RandInt(0, 2);
				atr.Charisma += RandInt(0, 2);
				break;
			case "Chancellor":
				distributeSkillsByTag(["Politican", "Personality"], 5);
				atr.Intrigue += RandInt(0, 2);
				atr.Charisma += RandInt(0, 2);
				break;
			case "Advisor":
				distributeSkillsByTag("Politican", 4);
				atr.Intrigue += RandInt(0, 2);
				atr.Charisma += RandInt(0, 2);
				break;
			case "Politican":
				distributeSkillsByTag("Politican", 3);
				atr.Intrigue += RandInt(0, 2);
				atr.Charisma += RandInt(0, 2);
				break;
			case "Trader":
				break;
			default:
			case "Commoner":
				// Nothing at all
				break; 
		}
	};
	minState = minState || -1;
	maxState = maxState || 99;
	if(person.Development <  minState) return;
	if(person.Development >= maxState) return;
	switch(person.Development)
	{
		case 0: // Child
			GiveBaseBaseAttributes(person);
			var choice = person.makeChoice("Development", ["Play", "Study"]);
			switch(choice)
			{
				case "Play":
					atr.Strength += 1;
					atr.Charisma += 1;
					break;
				case "Study":
					atr.Tactic    += 1;
					atr.Willpower += 1;
					break;
			}
			if(Math.random() < 0.1)
			{
				person.Traits.push("Talented");
				talented = 1;
			}
			else if(Math.random() < 0.05)
			{
				person.Traits.push("Genius");
				talented = 2;
			}
			else if(Math.random() < 0.2)
			{
				person.Traits.push("Incapable");
				incapable = true;
			}
			person.Development = 1;
			if(person.Development >= maxState) break;
		case 1: // Teenager
			if(person.Age < 12) break;
			var choice = person.makeChoice("Development", ["Sparring", "Socialize", "Study Tactics", "Study Politics"]);
			switch(choice)
			{
				case "Sparring":
					atr.Strength += 2;
					atr.Charisma -= 1;
					atr.Willpower += 1;
					distributeSkills([["Swordsman", 1], ["Spearbearer", 1], ["Archery", 1]]);
					if(Math.random() < 0.25)
						person.giveTrait("Bold");
					if(Math.random() < 0.10)
						person.giveTrait("Cruel");
					if(Math.random() < 0.25 && atr.Willpower > 3)
						person.giveTrait("Fierce");
					break;
				case "Socialize":
					atr.Strength     -= 1;
					atr.Charisma     += 2;
					distributeSkills([["Scholar", 1], ["Street Smarts", 1]]);
					if(Math.random() < 0.25)
						person.giveTrait("Affectionate");
					break;
				case "Study Tactics":
					atr.Tactic    += 1;
					atr.Willpower += 1;
					distributeSkillsByTag("Tactican", 1);
					if(Math.random() < 0.25)
						person.giveTrait("Cold Hearted");
					break;
				case "Study Politics":
					atr.Intrigue  += 2;
					atr.Charisma  += 1;
					atr.Willpower -= 1;
					distributeSkillsByTag("Politics", 1);
					if(Math.random() < 0.15)
						person.giveTrait("Cowardice");
					if(Math.random() < 0.15)
						person.giveTrait("Manipulative");
					break;
			}
			person.Development = 2;
			if(person.Development >= maxState) break;
		case 2: // Young adult
			if(person.Age < 16) break;
			var choices =  ["Study"];
			if(person.Rank.Name == "Commoner")
				choices.push("Enlist");
			var choice = person.makeChoice("Development", choices);
			switch(choice)
			{
				case "Enlist":
					person.Rank = new Rank("Soldier", person.Home.getFaction());
					atr.Strength += 1;
					atr.Tactic   += 1;
					distributeSkillsByTag("Fighter", 2);
					break;
				case "Study":
					atr.Tactic   += 1;
					atr.Intrigue += 1;
					atr.Charisma += 1;
					distributeSkillsByTag(["Tactican", "Politican"], 2);
					break;
			}
			person.Development = 3;
			if(person.Development >= maxState) break;
		case 3: // Adult
			if(person.Age < 24) break;
			advanceCareer();
			person.Development = 4;
			if(person.Development >= maxState) break;
		case 4: // Middle aged
			if(person.Age < 36) break;
			advanceCareer();
			person.Development = 5;
			if(person.Development >= maxState) break;
		case 5: // Old man
			if(person.Age < 50) break;
			advanceCareer();
			person.Development = 6;
			if(person.Development >= maxState) break;
	}
	person.calcAttributes();
}

function FindPartner(person, people, list)
{
	var gender = {male: "female", female: "male"}[person.Gender];
	var possiblePartners = people.filter(function(partner)
		{
			if(!partner.hasRelation("Spouse"))
			if(partner.Gender === gender)
			if(Math.abs(person.Age - partner.Age) < 10)
			if(person.Family != partner.Family)
			if(person.Home.Faction === partner.Home.Faction)
				return true;
			return false;
		});
	if(possiblePartners.length < 1)
	{
		var partner = Character.CreateToken(GameState.Families.randomElement(), GameState.Families.randomElement(), person.Age+RandInt(-10, +10), gender);
		partner.setHome(person.Home);
		if(list)
			list.push(partner);
		return partner;
	}
	else
	{
		return possiblePartners.randomElement();
	}
}

function GenerateOffspring(generation)
{
	var result = [];
	for (var i = 0; i < generation.length; i++)
	{
		var parent = generation[i];
		if(parent.hasRelation("Spouse")) continue;

		var amountChildren = RandInt(0, 2);
		var partners = [FindPartner(parent, generation)];

		partners.forEach(function(spouse, index)
		{
			parent.addRelation("Spouse", spouse);
			spouse.addRelation("Spouse", parent);
			// TODO: Social standing rather than gender
			if(parent.Gender === "male")
				spouse.setHome(parent.Home);
			else
				parent.setHome(spouse.Home);
		});

		var curAge = RandInt(17, 30);
		for(var j = 0; j < amountChildren; j++)
		{
			if(curAge > parent.Age)
				break;

			var partner = partners.randomElement();
			var father  = partner;
			var mother  = partner;
			if(parent.Gender === "male")
				father = parent;
			else
				mother = parent;

			var gender = ["male", "female"].randomElement();
			var child  = null;

			child = Character.CreateToken(parent.FatherFamily, partner.FatherFamily, parent.Age - curAge, gender);

			child.addRelation("Father", father);
			child.addRelation("Mother", mother);
			parent.addRelation("Child", child);
			partner.addRelation("Child", child);

			if(child.Age > 15)
				child.setHome(parent.Home.getFaction().getControlledCities().randomElement());
			else
				child.setHome(parent.Home);

			//DevelopCharacter(child, 0, 5);
			result.push(child);

			if(Math.random() < 0.8)
				curAge += RandInt(2, 4);
			else
				curAge += RandInt(5, 15);
		};
	};
	return result;
}
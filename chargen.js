"use strict";

var STRENGTH  = 0;
var TACTIC    = 1;
var CHARISMA  = 2;
var INTRIGUE  = 3;
var WILLPOWER = 4;

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

function GiveBaseAttributes(person)
{
	person.MainStat = [STRENGTH, TACTIC, CHARISMA, INTRIGUE, WILLPOWER].randomElement();
	person.Affinity = [RandInt(-1, 1), RandInt(-1, 1), RandInt(-1, 1), RandInt(-1, 1), RandInt(-1, 1)];
	person.Affinity[person.MainStat] += RandInt(1, 2);

	person.Stats = person.Affinity;
	person.Development = 0;
}

function DevelopCharacter(person, minState, maxState)
{
	var talented = person.hasTrait("Talented");
	var distributeSkills = function(skills)
	{
		var i = 1;
		if(talented)
			i = RandInt(1, Math.min(skills.length-1, 3));
		skills = skills.filter(function(skill)
		{ 
			var s = person.getSkill(skill[0]);
			var minLevel = skill[2];
			var maxLevel = (skill[1] || 1);
			if(!s)
				return minLevel == undefined;
			if(minLevel && s.Level < minLevel)
				return false;
			if(s.Level > maxLevel)
				return false;
			return true;
		});
		//console.log(skills, "vs", person.Skills);
		while(i && skills.length)
		{
			var skill = skills.popRandom();
			person.trainSkill(skill[0], 1, skill[1]||1);
			i -= 1;
		}
	};
	minState = minState || -1;
	maxState = maxState || 99;
	if(person.Development <  minState) return;
	if(person.Development >= maxState) return;
	switch(person.Development)
	{
		case 0: // Child
			GiveBaseAttributes(person);
			var choice = person.makeChoice("Development", ["Play", "Study"]);
			switch(choice)
			{
				case "Play":
					person.Stats[STRENGTH] += 1;
					person.Stats[CHARISMA] += 1;
					break;
				case "Study":
					person.Stats[TACTIC]    += 1;
					person.Stats[WILLPOWER] += 1;
					break;
			}
			if(Math.random() < 0.1)
			{
				person.Traits.push("Talented");
				talented = true;
			}
			person.Development = 1;
			if(person.Development >= maxState) break;
		case 1: // Teenager
			if(person.Age < 12) break;
			var choice = person.makeChoice("Development", ["Sparring", "Socialize", "Study Tactics", "Study Politics", "Help with Work"]);
			switch(choice)
			{
				case "Sparring":
					person.Stats[STRENGTH]  += 2;
					person.Stats[CHARISMA]  -= 1;
					person.Stats[WILLPOWER] += 1;
					distributeSkills([["Sword-Combat", 1], ["Spear-Combat", 1], ["Archery", 1]]);
					if(Math.random() < 0.25)
						person.giveTrait("Bold");
					if(Math.random() < 0.10)
						person.giveTrait("Cruel");
					if(Math.random() < 0.25 && person.Stats[WILLPOWER] > 3)
						person.giveTrait("Fierce");
					break;
				case "Socialize":
					person.Stats[STRENGTH] -= 1;
					person.Stats[CHARISMA] += 2;
					person.Stats[RandInt(0, 4)] += 1;
					distributeSkills([["Educated", 1], ["Street Smarts", 1]]);
					if(Math.random() < 0.25)
						person.giveTrait("Affectionate");
					break;
				case "Study Tactics":
					person.Stats[TACTIC]    += 1;
					person.Stats[WILLPOWER] += 1;
					distributeSkills([["Assault Tactics", 1], ["Siege Tactics", 1], ["Terrain Knowledge", 1]]);
					if(Math.random() < 0.25)
						person.giveTrait("Cold Hearted");
					break;
				case "Study Politics":
					person.Stats[INTRIGUE]  += 2;
					person.Stats[CHARISMA]  += 1;
					person.Stats[WILLPOWER] -= 1;
					distributeSkills([["Educated", 1], ["Negotiation", 1], ["Public Speaking", 1]]);
					if(Math.random() < 0.15)
						person.giveTrait("Cowardice");
					if(Math.random() < 0.15)
						person.giveTrait("Manipulative");
					break;
				case "Help with Work":
					person.Stats[STRENGTH]      += 1;
					person.Stats[RandInt(0, 4)] += 1;
					person.Stats[RandInt(0, 4)] += 1;
					distributeSkills([["Practical", 1], ["Diligent", 1], ["Construction", 1], ["Negotiation", 1]]);
					if(Math.random() < 0.15)
						person.giveTrait("Humble");
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
					person.Stats[STRENGTH] += 1;
					person.Stats[TACTIC]   += 1;
					distributeSkills([["Sword-Combat", 2], ["Spear-Combat", 2], ["Archery", 2]]);
					break;
				case "Study":
					person.Stats[TACTIC]   += 1;
					person.Stats[INTRIGUE] += 1;
					person.Stats[CHARISMA] += 1;
					distributeSkills([["Terrain Knowledge", 2], ["Educated", 2]]);
					break;
			}
			person.Development = 3;
			if(person.Development >= maxState) break;
		case 3: // Adult
			if(person.Age < 24) break;
			// No choice here
			switch(person.Rank.Name)
			{
				case "General":
					distributeSkills([["Sword-Combat", 5, 1], ["Spear-Combat", 5, 1], ["Archery", 5, 1]]);
					person.Stats[STRENGTH] += RandInt(0, 2);
					person.Stats[TACTIC] += RandInt(0, 2);
					break;
				case "Commander":
					distributeSkills([["Sword-Combat", 4, 1], ["Spear-Combat", 4, 1], ["Archery", 4, 1]]);
					person.Stats[TACTIC] += RandInt(0, 2);
					break;
				case "Soldier":
					distributeSkills([["Sword-Combat", 3, 1], ["Spear-Combat", 3, 1], ["Archery", 3, 1]]);
					person.Stats[STRENGTH] += RandInt(0, 2);
					break;
				case "Leader":
				case "Chancellor":
				case "Advisor":

					break;
				case "Politican":
				case "Trader":
					break;
				default:
				case "Commoner":
					// Nothing at all
					break; 
			}
			person.Development = 4;
			if(person.Development >= maxState) break;
		case 4: // Middle aged
			if(person.Age < 36) break;
			// No choice here either
			// No choice here
			switch(person.Rank.Name)
			{
				case "General":
					distributeSkills([["Sword-Combat", 5, 1], ["Spear-Combat", 5, 1], ["Archery", 5, 1]]);
					person.Stats[STRENGTH] += RandInt(0, 2);
					person.Stats[TACTIC] += RandInt(0, 2);
					break;
				case "Commander":
					distributeSkills([["Sword-Combat", 4, 1], ["Spear-Combat", 4, 1], ["Archery", 4, 1]]);
					person.Stats[TACTIC] += RandInt(0, 2);
					break;
				case "Soldier":
					distributeSkills([["Sword-Combat", 3, 1], ["Spear-Combat", 3, 1], ["Archery", 3, 1]]);
					person.Stats[STRENGTH] += RandInt(0, 2);
					break;
				case "Leader":
				case "Chancellor":
				case "Advisor":

					break;
				case "Politican":
				case "Trader":
					break;
				default:
				case "Commoner":
					// Nothing at all
					break; 
			}
			person.Development = 5;
			if(person.Development >= maxState) break;
		case 5: // Old man
			if(person.Age < 50) break;
			// TODO
			person.Development = 6;
			if(person.Development >= maxState) break;
	}
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
			parent.Relations.push(["Spouse", spouse]);
			spouse.Relations.push(["Spouse", parent]);
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

			child.Relations.push(["Father", father]);
			child.Relations.push(["Mother", mother]);
			parent.Relations.push(["Child", child]);
			partner.Relations.push(["Child", child]);

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
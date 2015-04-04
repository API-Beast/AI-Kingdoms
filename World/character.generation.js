"use strict";

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

function GenerateBaseGeneration(numPeople)
{
	if(!GameState.Families || GameState.Families.length === 0)
	{
		GameState.Families = [];
		var familyNames = FamilyNames.shuffle();
		for (var i = 40; i >= 0; i--)
		{
			GameState.Families.push({
				Name: familyNames[i],
				Traits: [],
				Stats: [RandInt(-1, 3), RandInt(-1, 3), RandInt(-1, 3), RandInt(-1, 3), RandInt(-1, 3)],
				Faction: null});
		}
	}

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
	var atr = person.Attributes.Base;

	var distributeSkills = function(skills)
	{
		var i = person.Attributes.get("Learning");
		var onlyTrain = person.Skills.length > person.Attributes.get("Skill Diversity");
		skills = skills.shuffle();
		while(i && skills.length)
		{
			var tmp      = skills.pop();
			var skill    = tmp[0];
			var maxLevel = tmp[1] || 1;

			var entry    = person.Skills.get(skill);

			if(!entry && onlyTrain) continue;
			if(!entry)
			{
				person.Skills.add(skill, 1);
				i -= 1;
			}
			else if(entry.Level < maxLevel)
			{
				entry.Level++;
				i -= 1;
			}
		}
		person.calcAttributes();
	};

	var distributeSkillsByTag = function(tags, maxLevel)
	{
		var skills;
		if(typeof tags === 'object')
			skills = Data.SkillsArray.filter(function(skill){ return skill.Tags.some(function(t){ return tags.contains(t); }); });
		else
			skills = Data.SkillsArray.filter(function(skill){ return skill.Tags.contains(tags); });
		skills = skills.filter(function(skill){ return skill.preReqFulfilled(person); });
		skills = skills.map(function(skill){ return [skill, maxLevel]; });
		distributeSkills(skills);
	};

	var distributeTraitsByTag = function(tags, numTraits)
	{
		var traits;
		if(typeof tags === 'object')
			traits = Data.TraitsArray.filter(function(trait){ return trait.Tags.some(function(t){ return tags.contains(t); }); });
		else
			traits = Data.TraitsArray.filter(function(trait){ return trait.Tags.contains(tags); });
		var i = numTraits;
		while(i && traits.length)
		{
			var trait = traits.popRandom();
			if(!person.Traits.get(trait.Name))
			if(trait.Weight >= 1 || Math.random() < trait.Weight)
			if(trait.preReqFulfilled(person))
			{
				i -= 1;
				person.Traits.add(Data.Traits[trait.Name]);
			}
		}
		person.calcAttributes();
	};

	var advanceCareer = function()
	{
		switch(person.Rank.Name)
		{
			case "General":
				distributeSkillsByTag(["Fighter", "Tactican", "Personality"], 5);
				atr.Strength += RandInt(0, 2);
				atr.Tactics   += RandInt(0, 2);
				break;
			case "Commander":
				distributeSkillsByTag(["Fighter", "Tactican"], 4);
				atr.Strength += RandInt(0, 2);
				atr.Tactics   += RandInt(0, 2);
				break;
			case "Soldier":
				distributeSkillsByTag("Fighter", 4);
				atr.Strength += RandInt(0, 2);
				atr.Tactics   += RandInt(0, 2);
				break;
			case "Leader":
				distributeSkillsByTag(["Social", "Politican", "Personality"], 5);
				atr.Intrigue += RandInt(0, 2);
				atr.Charisma += RandInt(0, 2);
				break;
			case "Chancellor":
				distributeSkillsByTag(["Social", "Politican", "Personality"], 5);
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
			
			if(Math.random() > 0.60)
				distributeTraitsByTag("Child", 1);
			
			var choice = person.makeChoice("Development", ["Play", "Study"]);
			switch(choice)
			{
				case "Play":
					atr.Strength += 1;
					atr.Charisma += 1;
					break;
				case "Study":
					atr.Tactics   += 1;
					atr.Willpower += 1;
					break;
			}
			person.Development = 1;
			if(person.Development >= maxState) break;
		case 1: // Teenager
			if(person.Age < 12) break;

			distributeTraitsByTag("Teen", RandInt(1, 2));
			var choice = person.makeChoice("Development", ["Sparring", "Socialize", "Study Tactics", "Study Politics"]);
			switch(choice)
			{
				case "Sparring":
					atr.Strength += 2;
					atr.Charisma -= 1;
					atr.Willpower += 1;
					distributeSkillsByTag(["Basic", "Fighter"], 2);
					break;
				case "Socialize":
					atr.Strength     -= 1;
					atr.Charisma     += 2;
					distributeSkillsByTag(["Basic", "Social"], 2);
					break;
				case "Study Tactics":
					atr.Tactics    += 1;
					atr.Willpower += 1;
					distributeSkillsByTag(["Basic", "Tactican"], 1);
					break;
				case "Study Politics":
					atr.Intrigue  += 2;
					atr.Charisma  += 1;
					atr.Willpower -= 1;
					distributeSkillsByTag(["Basic", "Politics"], 1);
					break;
			}
			person.Development = 2;
			if(person.Development >= maxState) break;
		case 2: // Young adult
			if(person.Age < 16) break;

			distributeTraitsByTag("Adult", 1);
			var choices =  ["Study"];
			if(person.Rank.Name == "Commoner")
				choices.push("Enlist");
			var choice = person.makeChoice("Development", choices);
			switch(choice)
			{
				case "Enlist":
					person.Rank = new Rank("Soldier", person.Home.getFaction());
					atr.Strength += 1;
					atr.Tactics   += 1;
					distributeSkillsByTag("Fighter", 2);
					break;
				case "Study":
					atr.Tactics   += 1;
					atr.Intrigue += 1;
					atr.Charisma += 1;
					distributeSkillsByTag(["Tactican", "Politican"], 2);
					break;
			}
			person.Development = 3;
			if(person.Development >= maxState) break;
		case 3: // Adult 1
			if(person.Age < 20) break;

			distributeTraitsByTag("Adult", 1);
			advanceCareer();
			person.Development = 4;
			if(person.Development >= maxState) break;
		case 4: // Adult 2
			if(person.Age < 26) break;
			advanceCareer();
			person.Development = 5;
			if(person.Development >= maxState) break;
		case 5: // Adult 3
			if(person.Age < 32) break;
			advanceCareer();
			person.Development = 6;
			if(person.Development >= maxState) break;
		case 6: // Adult 4
			if(person.Age < 40) break;
			advanceCareer();
			person.Development = 7;
			if(person.Development >= maxState) break;
		case 7: // Middle aged
			if(person.Age < 50) break;
			advanceCareer();
			person.Development = 8;
			if(person.Development >= maxState) break;
		case 8: // Old
			if(person.Age < 65) break;
			advanceCareer();
			person.Development = 9;
			if(person.Development >= maxState) break;
		case 9: // Very old
			if(person.Age < 80) break;
			advanceCareer();
			person.Development = 10;
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
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

		result.push(father);
		result.push(mother);
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
}

function AgeCharacter(person, years)
{
	GiveBaseAttributes(person);
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
		var partners = [FindPartner(parent, generation, result)];

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

			child.Relations.push(["Father", parent]);
			child.Relations.push(["Mother", partner]);
			parent.Relations.push(["Child", child]);
			partner.Relations.push(["Child", child]);

			if(child.Age > 15)
				child.setHome(parent.Home.getFaction().getControlledCities().randomElement());
			else
				child.setHome(parent.Home);

			AgeCharacter(child, child.Age);
			result.push(child);

			if(Math.random() < 0.8)
				curAge += RandInt(2, 4);
			else
				curAge += RandInt(5, 15);
		};
	};
	return result;
}
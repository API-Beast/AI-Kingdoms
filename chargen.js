var STRENGTH  = 0;
var TACTIC    = 1;
var CHARISMA  = 2;
var INTRIGUE  = 3;
var WILLPOWER = 4;

GameState.Families = [];

FamilyNames = ["Li","Wang","Zhang","Liu","Chen","Yang","Zhao","Huang",
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

function DistributeTraits(person)
{
	var possibleTraits = ["Honorable", "Deceiving", "Wealthy", "Friendly", "Healthy", "Lustful", "Impotent"];
	var traitsByRank = {
		General:   ["Strategic Genius", "Defender", "Attacker", "War Hardened", "Ambush Tactics"],
		Commander: ["War Hardened", "Defender", "Attacker", "Great Speaker"],
		Soldier:   ["Troublemaker", "Resilent", "Berserk"],
		Advisor:   ["Trader", "Teacher"],
		Mandarin:  ["Trader", "Reclusive", "Coward"],
		Specialist:["Assassin", "Spy", "Scout", "Negationer"],
		Commoner:  ["Coward", "Naive"],
		Retired:   ["Coward"]
	};
	if(person.Rank)
		possibleTraits = possibleTraits.concat(traitsByRank[person.Rank]);

	if(person.Age < 40)
		possibleTraits.push("Seductive");
	if(person.Age > 40)
		possibleTraits.push("Wise");
	if(person.Age > 60)
		possibleTraits.push("Senile");

	var numTraits = RandInt(0, 2 + person.Age / 20);
	for(var k = numTraits; k > 0; k--)
		person.Traits.push(possibleTraits.randomElement());
	person.Traits.removeDuplicates();
}

function GenerateCharacter(familyA, familyB, age)
{
	var baseStats  = familyA.Stats;
	var baseTraits = familyA.Traits;

	if(familyA != familyB)
	{
		baseStats  = ArrayAdd(familyA.Stats, familyB.Stats);

		baseTraits = baseTraits.concat(familyB.Traits);
		baseTraits = baseTraits.removeDuplicates();
	}

	var person = {
		Name           : RandomMaleName(),
		Gender         : "male",
		Surname        : familyA.Name,
		Family         : familyA,
		MaternalFamily : familyB,
		Stats          : [],
		Age            : age,
		LiveExpectation : RandBellCurve(40, 100),
		Alive          : true,
		Traits         : [],
		Relations      : [],
		Rank           : "Commoner",
		Home           : null
	};
	person.Stats  = baseStats.map(function(val){ return RandInt(val-1, val+2);});

	if(person.Age > person.LiveExpectation)
		person.Alive  = false;

	person.Traits = baseTraits.slice();
	return person;
}

function GenerateMan(familyA, familyB, age)
{
	var person = {
		Name            : RandomMaleName(),
		Gender          : "male",
		Surname         : familyA.Name,
		Family          : familyA,
		MaternalFamily  : familyB,
		Age             : age,
		LiveExpectation : RandBellCurve(40, 100),
		Alive           : true,
		Relations       : []
	};
	if(person.Age > person.LiveExpectation)
		person.Alive  = false;
	return person;
}

function GenerateWoman(familyA, familyB, age)
{
	var person = {
		Name            : RandomFemaleName(),
		Gender          : "female",
		Surname         : familyA.Name,
		Family          : familyA,
		MaternalFamily  : familyB,
		Age             : age,
		LiveExpectation : RandBellCurve(40, 100),
		Alive           : true,
		Relations       : []
	};
	if(person.Age > person.LiveExpectation)
		person.Alive  = false;
	return person;
}

function CompleteCharacterSheet(person)
{
	var familyA = person.Family;
	var familyB = person.MaternalFamily;

	var baseStats  = familyA.Stats;
	var baseTraits = familyA.Traits;

	if(familyA != familyB)
	{
		baseStats  = ArrayAdd(familyA.Stats, familyB.Stats);

		baseTraits = baseTraits.concat(familyB.Traits);
		baseTraits = baseTraits.removeDuplicates();
	}

	person.Stats  = baseStats.map(function(val){ return RandInt(val-1, val+2);});
	person.Traits = baseTraits.slice();
}

function GenerateBaseGeneration(numPeople)
{
	var result = [];
	for (var i = 0; i < numPeople; i++)
	{
		var familyA   = GameState.Families.randomElement();
		var familyB   = GameState.Families.randomElement();

		var person  = GenerateCharacter(familyA, familyB, RandInt(60, 120));
		person.Rank = ["General", "Commander", "Soldier"].randomElement();
		DistributeTraits(person);
		var father = GenerateMan  (familyA, GameState.Families.randomElement(), person.Age + RandInt(16, 50));
		var mother = GenerateWoman(familyB, GameState.Families.randomElement(), person.Age + RandInt(15, 30));
		person.Relations.push(["Father", father]);
		person.Relations.push(["Mother", mother]);
		result.push(father);
		result.push(mother);

		if(person.Rank == "General")
		{
			person.Stats[STRENGTH] += RandInt(1, 2);
			person.Stats[TACTIC]   += RandInt(2, 4);
		}
		else if(person.Rank == "Commander" || person.Rank == "Soldier")
		{
			person.Stats[STRENGTH] += RandInt(1, 2);
			person.Stats[TACTIC]   += RandInt(1, 2);
		}
		else if(person.Rank == "Mandarin")
		{
			person.Stats[CHARISMA] += RandInt(0, 1);
			person.Stats[INTRIGUE] += RandInt(1, 2);
		}
		else if(person.Rank == "Advisor")
		{
			person.Stats[CHARISMA] += RandInt(1, 4);
			person.Stats[INTRIGUE] += RandInt(1, 2);
		}
		else if(person.Rank == "Retired")
		{
			person.Stats[STRENGTH] += RandInt(0, 2);
			person.Stats[TACTIC]   += RandInt(0, 2);
			person.Stats[CHARISMA] += RandInt(0, 2);
			person.Stats[INTRIGUE] += RandInt(0, 2);
		}

		result.push(person);
	};
	return result;
}

function GenerateOffspring(generation)
{
	var result = [];
	for (var i = 0; i < generation.length; i++)
	{
		var father = generation[i];
		if(father.Gender == "female") continue;
		if(!father.hasOwnProperty("Traits")) continue;

		var amountChildren = RandInt(0, 2);
		var partners = [GenerateWoman(GameState.Families.randomElement(), RandInt(14, father.Age))];

		if(father.Traits.contains("Lustful"))
		{
			amountChildren += RandInt(1, 3);
			partners.push(GenerateWoman(GameState.Families.randomElement(), RandInt(14, father.Age)));
		}
		if(father.Traits.contains("Impotent") || father.Traits.contains("Homosexual"))
			amountChildren  = RandInt(0, 1);

		for(var k = 0; k < partners.length; k++)
		{
			var spouse = partners[k];
			GameState.SecondaryCharacters.push(spouse);
			father.Relations.push(["Spouse", spouse]);
			spouse.Relations.push(["Spouse", father]);
		}

		var currentAgeFather = RandInt(17, 30);
		for(var j = 0; j < amountChildren; j++)
		{
			if(currentAgeFather > father.Age)
				break;

			var mother = partners.randomElement();
			var gender = ["male", "female"].randomElement();
			var child  = null;
			if(gender == "male")
			{
				child  = GenerateCharacter(father.Family, mother.Family, father.Age - currentAgeFather);
				if(child.Age > 16)
					child.Rank = ["Commander", "Soldier", "Soldier", "Soldier"].randomElement();
				if(child.Age > 28)
					child.Rank = ["General", "Commander", "Soldier", "Soldier"].randomElement();
				if(child.Age > 40)
					child.Rank = ["General", "Commander", "Soldier"].randomElement();
				DistributeTraits(child);
			}
			else
				child = GenerateWoman(father.Family, father.Age - currentAgeFather);

			child.Relations.push(["Father", father]);
			child.Relations.push(["Mother", mother]);
			father.Relations.push(["Child", child]);
			mother.Relations.push(["Child", child]);

			result.push(child);

			if(Math.random() < 0.8)
				currentAgeFather += RandInt(2, 4);
			else
				currentAgeFather += RandInt(5, 15);
		};
	};
	return result;
}
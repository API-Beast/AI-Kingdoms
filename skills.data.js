"use strict";

var Skills = {};
var SkillsArray = [];

var Traits      = {};
var TraitsArray = [];

// ------
// Skills
// ------

function SkillDefinition(name, tag, template)
{
	var skill = new Skill(name, tag, template);
	Skills[skill.Name] = skill;
	SkillsArray.push(skill);
}

// Tactican
// Basic
SkillDefinition("Strategist",      "Tactican", {Attributes: ["Tactics", 2] });
SkillDefinition("Assault Tactics", "Tactican", {PreReq:{ Skills: ["Strategist", 1]}, Attributes: ["Tactics", 3], Condition: ["Assaulting"] });
SkillDefinition("Defense Tactics", "Tactican", {PreReq:{ Skills: ["Strategist", 1]}, Attributes: ["Tactics", 3], Condition: ["Defending" ] });
// Advanced
SkillDefinition("Siege Expert",    "Tactican", {PreReq:{ Attributes: ["Tactics", 6], Skills: ["Assault Tactics", 1] }, Attributes: ["Tactics", 3], Condition: ["Sieging" ]});

SkillDefinition("Terrain Expert",  "Tactican", {PreReq:{ Attributes: ["Tactics", 6], Skills: ["Defense Tactics", 1] }, Attributes: ["Tactics", 3], Condition: ["Mountain"]});

SkillDefinition("Ambusher",        "Tactican", {PreReq:{ Attributes: ["Tactics", 6], Skills: ["Assault Tactics", 1] }, Description: "Will apply Ambush tactics when appropriate.",  AddTag: ["Ambusher"]});

SkillDefinition("Logistics",       "Tactican", {PreReq:{ Attributes: ["Tactics", 6], Skills: ["Strategist", 2] }, Attributes: ["Movement-Rate", 0.25] });

// Fighter
// Basic
SkillDefinition("Warrior",     "Fighter", { Attributes: ["Strength", 2] });
SkillDefinition("Swordsman",   "Fighter", {PreReq:{ Skills: ["Warrior", 1]}, Attributes: ["Strength", 3], Condition: [["Not", "In Formation"]]});
SkillDefinition("Spearbearer", "Fighter", {PreReq:{ Skills: ["Warrior", 1]}, Attributes: ["Strength", 3], Condition: ["In Formation"] });
SkillDefinition("Archery",     "Fighter", {PreReq:{ Skills: ["Warrior", 1]}, Description:["{1} Chance to kill a target without a duel.", ["Slight", "Low", "Minor", "Major", "High"]], AddTag: ["Archery"] });
// Advanced
SkillDefinition("Berserker",   "Fighter", {PreReq:{ Attributes: ["Strength", 6], Traits: ["Fierce"]},
																					Description:"May fall into a Berserk rage.", AddTag: ["Berserker"],
																					AttrMult: ["Strength", +0.2], Condition: ["Berserk"]});

SkillDefinition("Ironwall",    "Fighter", {PreReq:{ Attributes: ["Strength", 6], Skills: ["Spearbearer", 1]},
																					Description:"Will not break formation, even if the morale is low.", AddTag: ["Ironwall" ],
																					Attributes: ["Strength", 2], Condition: ["In Formation"]});

SkillDefinition("Assassin",    "Fighter", {PreReq:{ Attributes: ["Strength", 6], Skills: ["Swordsman", 1]},
																					Description:"Will try to kill high ranking characters during combat.", AddTag: ["Assassin" ],
																					Attributes: ["Strength", 2], Condition: ["Duel"]});

// Politican
// Basic
SkillDefinition("Smart",           ["Basic", "Politican"], { Attributes: ["Intrigue", 2, "Tactics", 1] });
SkillDefinition("Charismatic",     ["Basic", "Politican"], { Attributes: ["Charisma", 2] });
SkillDefinition("Wealthy",         "Politican", {PreReq:{ Skills: ["Charismatic", 1]}}, { Attributes: ["Income",    25]});
SkillDefinition("Administrator",   "Politican", {PreReq:{ Skills: ["Smart",       1]}}, { Attributes: ["Governance", 1]});
// Advanced
SkillDefinition("Shemer",          "Politican", { Attributes: ["ActionPoints", 1],                         PreReq:{ Attributes: ["Intrigue", 6]} });
SkillDefinition("Foreign Customs", "Politican", { Attributes: ["Charisma",     3], Condition: ["Foreign"], PreReq:{ Attributes: ["Charisma", 6], Skills: ["Scholar", 1]} });
SkillDefinition("Seduction",       "Politican", { AddTag: ["Seduction"],                             PreReq:{ Attributes: ["Charisma", 6]} });

// General
// Social
SkillDefinition("Socializer",    "Social", { AddTag: ["Socializer"],         PreReq:{ Attributes: ["Charisma", 4]} });
SkillDefinition("Scholar",       "Social", { Attributes: ["Respect Scholar",   1], PreReq:{ Traits: ["Rational"] } });
SkillDefinition("Honorable",     "Social", { Attributes: ["Respect Honorable", 1], PreReq:{ Traits: ["Honest"]   } });
// Personality
SkillDefinition("Inspiration" , "Personality", { AddTag: ["Inspiration" ], Attributes: ["Charisma", 1], PreReq:{ Attributes: ["Charisma", 4]} });
SkillDefinition("Intimidation", "Personality", { AddTag: ["Intimidation"], Attributes: ["Charisma", 1], PreReq:{ Attributes: ["Charisma", 4]} });
SkillDefinition("Willpower"   , "Personality", { AddTag: ["Heroism"],      Attributes: ["Strength", 3], Condition: ["In Danger"] });

// ------
// Traits
// ------

function TraitDefinition(name, tag, template)
{
	var trait = new Skill(name, tag, template);
	trait.IsTrait = true;
	Traits[trait.Name] = trait;
	TraitsArray.push(trait);
}

// These traits are distributed upon beeing born.
TraitDefinition("Healthy",     "Child", {Icon: "Healthy", Exclusive: ["Sickly"], AttrMult: ["Charisma", +0.1, "Strength", +0.1], Attributes: ["Health", +10] });
TraitDefinition("Sickly",      "Child", {Icon: "Sickly",  Exclusive: ["Healthy"], AttrMult: ["Charisma", -0.1, "Strength", -0.1], Attributes: ["Health", -10] });
//TraitDefinition("Brave",       "Child", {Exclusive: ["Coward"], Attributes: ["Strength", +1], Likes: ["Brave"],  AddTag: ["Brave"] });
// These traits are distributed upon reaching teenage age.
TraitDefinition("Fierce",      "Teen",  {Icon: "Fierce",   Exclusive: ["Rational"], AttrMult: ["Strength", +0.2, "Tactics", -0.2] });
TraitDefinition("Rational",    "Teen",  {Icon: "Rational", Exclusive: ["Fierce"],   AttrMult: ["Tactics", +0.2]});
TraitDefinition("Monstrous",   "Teen",  {Icon: "Monstrous", Weight: 0.25,           AttrMult: ["Strength", +0.4, "Charisma", -0.4] });
TraitDefinition("Talented",    "Teen",  {Icon: "Talented", Exclusive: ["Incapable"], Attributes: ["Learning", +1], Likes: ["Talented"]});
TraitDefinition("Dilligent",   "Teen",  {Icon: "Dilligent", Attributes: ["Learning", +1] });
TraitDefinition("Honest",      "Teen",  {Icon: "Honest", Exclusive: ["Manipulative"], AttrMult: ["Intrigue", -0.2], Likes: ["Honest"], Dislikes: ["Manipulative"] });
TraitDefinition("Empathic",    "Teen",  {Icon: "Empathic", Exclusive: ["Cruel", "Manipulative"], Attributes: ["Charisma", +4], Likes: ["Honest"], Dislikes: ["Cruel", "Manipulative"] });
//TraitDefinition("Coward",      "Teen",  {Exclusive: ["Brave"], Attributes: ["Intrigue", +1, "Charisma", -2] });
// These traits are distributed upon reaching adulthood.
TraitDefinition("Calculating", "Adult", {Icon: "Calculating", Exclusive: ["Fierce"], AttrMult: ["Tactics", +0.2, "Intrigue", +0.2, "Charisma", -0.2] });
TraitDefinition("Incapable",   "Adult", {Icon: "Incapable", Exclusive: ["Talented"], Attributes: ["Learning", -1] });
TraitDefinition("Focused",     "Adult", {Icon: "Focused", Attributes: ["Skill Diversity", -1] });
TraitDefinition("Manipulative","Adult", {Icon: "Manipulative", Weight: 0.50, Exclusive: ["Honest", "Empathic"], AttrMult: ["Intrigue", +0.4, "Charisma", -0.2] });
TraitDefinition("Cruel",       "Adult", {Icon: "Cruel", Weight: 0.50, Exclusive: ["Empathic", "Cruel"], AttrMult: ["Charisma", -0.4], Dislikes: ["Empathic"], AddTag: ["Cruel"] });
TraitDefinition("Lustful",     "Adult", {Icon: "Lustful", Attributes: ["Fertility", +1] });
TraitDefinition("Pacifist",    "Adult", {Icon: "Pacifist", Description: "Will try to solve conflicts without violence.", Weight: 0.25, Exclusive: ["Cruel"], AddTag: ["Pacifist"], AttrMult: ["Strength", -0.2], Dislikes: ["Cruel"] });
//TraitDefinition("Infertile",   "Adult", {Weight: 0.25, Exclusive: ["Lustful"], Attributes: ["Fertility", -1] });
TraitDefinition("Dominant",    "Adult", {Icon: "Dominant", Weight: 0.50, Exclusive: ["Obedient"], AttrMult: ["Charisma", +0.4]});
TraitDefinition("Obedient",    "Adult", {Icon: "Obedient", Weight: 0.50, Exclusive: ["Dominant", "Cruel"], Attributes: ["Charisma", +4, "Intrigue", -2], Likes: ["Dominant"] });
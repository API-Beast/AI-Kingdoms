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
SkillDefinition("Strategist",      "Tactican", { Attributes: ["Tactics", 2] });
SkillDefinition("Assault Tactics", "Tactican", { Attributes: ["Tactics", 3], Condition: ["Assaulting"], PreReq:{ Skills: ["Strategist", 1] } });
SkillDefinition("Defense Tactics", "Tactican", { Attributes: ["Tactics", 3], Condition: ["Defending" ], PreReq:{ Skills: ["Strategist", 1] } });
// Advanced
SkillDefinition("Siege Expert",    "Tactican", { Attributes: ["Tactics", 3], Condition: ["Sieging" ], PreReq:{ Attributes: ["Tactics", 6], Skills: ["Assault Tactics", 1] } });
SkillDefinition("Terrain Expert",  "Tactican", { Attributes: ["Tactics", 3], Condition: ["Mountain"], PreReq:{ Attributes: ["Tactics", 6], Skills: ["Defense Tactics", 1] } });
SkillDefinition("Ambusher",        "Tactican", { EnableEvents: ["Ambusher"],                          PreReq:{ Attributes: ["Tactics", 6], Skills: ["Assault Tactics", 1] } });
SkillDefinition("Logistics",       "Tactican", { Attributes: ["MovementRate", 0.25],                  PreReq:{ Attributes: ["Tactics", 6], Skills: ["Strategist", 2] } });

// Fighter
// Basic
SkillDefinition("Warrior",     "Fighter", { Attributes: ["Strength", 2] });
SkillDefinition("Swordsman",   "Fighter", { Attributes: ["Strength", 3], Condition: [["Not", "In Formation"]], PreReq:{ Skills: ["Warrior", 1]} });
SkillDefinition("Spearbearer", "Fighter", { Attributes: ["Strength", 3], Condition: ["In Formation"],          PreReq:{ Skills: ["Warrior", 1]} });
SkillDefinition("Archery",     "Fighter", { EnableEvents: ["Archery"],                                         PreReq:{ Skills: ["Warrior", 1]} });
// Advanced
SkillDefinition("Berserker",   "Fighter", { EnableEvents: ["Berserker"],                                                          PreReq:{ Attributes: ["Strength", 6], Traits: ["Fierce"]          } });
SkillDefinition("Ironwall",    "Fighter", { EnableEvents: ["Ironwall"], Attributes: ["Strength", 2], Condition: ["In Formation"], PreReq:{ Attributes: ["Strength", 6], Skills: ["Spearbearer", 1] } });
SkillDefinition("Assassin",    "Fighter", { EnableEvents: ["Assassin"], Attributes: ["Strength", 2], Condition: ["Duel"],         PreReq:{ Attributes: ["Strength", 6], Skills: ["Swordsman", 1]   } });

// Politican
// Basic
SkillDefinition("Smart",           ["Basic", "Politican"], { Attributes: ["Intrigue",   2, "Tactics", 1] });
SkillDefinition("Charismatic",     ["Basic", "Politican"], { Attributes: ["Charisma",   2] });
SkillDefinition("Wealthy",         "Politican", { Attributes: ["Income",    25], PreReq:{ Skills: ["Charismatic", 1]} });
SkillDefinition("Administration",  "Politican", { Attributes: ["Governance", 1], PreReq:{ Skills: ["Smart",       1]} });
// Advanced
SkillDefinition("Shemer",          "Politican", { Attributes: ["ActionPoints", 1],                         PreReq:{ Attributes: ["Intrigue", 6]} });
SkillDefinition("Foreign Customs", "Politican", { Attributes: ["Charisma",     3], Condition: ["Foreign"], PreReq:{ Attributes: ["Charisma", 6], Skills: ["Scholar", 1]} });
SkillDefinition("Seduction",       "Politican", { EnableEvents: ["Seduction"],                             PreReq:{ Attributes: ["Charisma", 6]} });

// General
// Social
SkillDefinition("Socializer",    "Social", { EnableEvents: ["Socializer"],         PreReq:{ Attributes: ["Charisma", 4]} });
SkillDefinition("Scholar",       "Social", { Attributes: ["Respect Scholar",   1], PreReq:{ Traits: ["Rational"] } });
SkillDefinition("Honorable",     "Social", { Attributes: ["Respect Honorable", 1], PreReq:{ Traits: ["Honest"]   } });
// Personality
SkillDefinition("Inspiration" , "Personality", { EnableEvents: ["Inspiration" ], Attributes: ["Charisma", 1], PreReq:{ Attributes: ["Charisma", 4]} });
SkillDefinition("Intimidation", "Personality", { EnableEvents: ["Intimidation"], Attributes: ["Charisma", 1], PreReq:{ Attributes: ["Charisma", 4]} });
SkillDefinition("Willpower"   , "Personality", { EnableEvents: ["Heroism"],      Attributes: ["Strength", 3], Condition: ["In Danger"] });

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
TraitDefinition("Healthy",     "Child", {Icon: "Healthy", Exclusive: ["Sickly"],     Attributes: ["Charisma", +2, "Strength", +1, "Health", +10] });
TraitDefinition("Sickly",      "Child", {Icon: "Sickly",  Exclusive: ["Healthy"],    Attributes: ["Charisma", -1, "Strength", -4, "Health", -10] });
//TraitDefinition("Brave",       "Child", {Exclusive: ["Coward"], Attributes: ["Strength", +1], Likes: ["Brave"],  EnableEvents: ["Brave"] });
// These traits are distributed upon reaching teenage age.
TraitDefinition("Fierce",      "Teen",  {Icon: "Fierce",   Exclusive: ["Rational"],   Attributes: ["Strength", +3, "Tactics", -2] });
TraitDefinition("Rational",    "Teen",  {Icon: "Rational", Exclusive: ["Fierce"],     Attributes: ["Tactics", +2] });
TraitDefinition("Monstrous",   "Teen",  {Icon: "Monstrous", Weight: 0.25, Attributes: ["Strength", +4, "Charisma", -3] });
TraitDefinition("Talented",    "Teen",  {Icon: "Talented", Exclusive: ["Incapable"], Attributes: ["Learning", +1], Likes: ["Talented"]});
TraitDefinition("Dilligent",   "Teen",  {Icon: "Dilligent", Attributes: ["Learning", +1] });
TraitDefinition("Honest",      "Teen",  {Icon: "Honest",   Exclusive: ["Manipulative"], Attributes: ["Intrigue", -2], Likes: ["Honest"], Dislikes: ["Manipulative"] });
TraitDefinition("Empathic",    "Teen",  {Icon: "Empathic", Exclusive: ["Cruel", "Manipulative"], Attributes: ["Charisma", +2], Likes: ["Honest"], Dislikes: ["Cruel", "Manipulative"] });
//TraitDefinition("Coward",      "Teen",  {Exclusive: ["Brave"], Attributes: ["Intrigue", +1, "Charisma", -2] });
// These traits are distributed upon reaching adulthood.
TraitDefinition("Calculating", "Adult", {Icon: "Calculating", Exclusive: ["Fierce"], Attributes: ["Tactics", +2, "Intrigue", +2, "Charisma", -2] });
TraitDefinition("Incapable",   "Adult", {Icon: "Incapable", Exclusive: ["Talented"], Attributes: ["Learning", -1] });
TraitDefinition("Focused",     "Adult", {Icon: "Focused", Attributes: ["Skill Diversity", -1] });
TraitDefinition("Manipulative","Adult", {Icon: "Manipulative", Weight: 0.50, Exclusive: ["Honest", "Empathic"], Attributes: ["Intrigue", +4, "Charisma", -2] });
TraitDefinition("Cruel",       "Adult", {Icon: "Cruel",   Exclusive: ["Empathic"], Attributes: ["Charisma", -2], Dislikes: ["Empathic"], EnableEvents: ["Cruel"] });
TraitDefinition("Lustful",     "Adult", {Icon: "Lustful", Exclusive: ["Infertile"], Attributes: ["Fertility", +1] });
//TraitDefinition("Infertile",   "Adult", {Weight: 0.25, Exclusive: ["Lustful"], Attributes: ["Fertility", -1] });
TraitDefinition("Dominant",    "Adult", {Icon: "Dominant", Weight: 0.50, Exclusive: ["Obedient"], Attributes: ["Charisma", +2, "Intrigue", +2]});
TraitDefinition("Obedient",    "Adult", {Icon: "Obedient", Weight: 0.50, Exclusive: ["Dominant", "Cruel"],   Attributes: ["Charisma", +2, "Intrigue", -2], Likes: ["Dominant"] });
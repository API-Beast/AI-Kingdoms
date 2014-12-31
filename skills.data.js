"use strict";

var Skills = {};
var SkillsArray = [];

function SkillDefinition(name, tag, template)
{
	var skill = new Skill(name, tag, template);
	Skills[skill.Name] = skill;
	SkillsArray.push(skill);
}

// Tactican
// Basic
SkillDefinition("Strategist",      "Tactican", { Attributes: ["Tactics", 1] });
SkillDefinition("Assault Tactics", "Tactican", { Attributes: ["Tactics", 2], Condition: ["Assaulting"], PreReq:{ Skills: ["Strategist", 1] } });
SkillDefinition("Defense Tactics", "Tactican", { Attributes: ["Tactics", 2], Condition: ["Defending" ], PreReq:{ Skills: ["Strategist", 1] } });
// Advanced
SkillDefinition("Siege Expert",    "Tactican", { Attributes: ["Tactics", 2], Condition: ["Sieging" ], PreReq:{ Attributes: ["Tactics", 6], Skills: ["Assault Tactics", 1] } });
SkillDefinition("Terrain Expert",  "Tactican", { Attributes: ["Tactics", 2], Condition: ["Mountain"], PreReq:{ Attributes: ["Tactics", 6], Skills: ["Defense Tactics", 1] } });
SkillDefinition("Ambusher",        "Tactican", { EnableEvents: ["Ambusher"],                          PreReq:{ Attributes: ["Tactics", 6], Skills: ["Assault Tactics", 1] } });
SkillDefinition("Logistics",       "Tactican", { Attributes: ["MovementRate", 0.25],                  PreReq:{ Attributes: ["Tactics", 6], Skills: ["Strategist", 2] } });

// Fighter
// Basic
SkillDefinition("Warrior",     "Fighter", { Attributes: ["Strength", 1] });
SkillDefinition("Swordsman",   "Fighter", { Attributes: ["Strength", 1], Condition: [["Not", "In Formation"]] });
SkillDefinition("Spearbearer", "Fighter", { Attributes: ["Strength", 1], Condition: ["In Formation"] });
SkillDefinition("Archery",     "Fighter", { EnableEvents: ["Archery"] });
// Advanced
SkillDefinition("Berserker",   "Fighter", { EnableEvents: ["Berserker"],                                                          PreReq:{ Attributes: ["Strength", 6], Traits: ["Wrath"]          } });
SkillDefinition("Ironwall",    "Fighter", { EnableEvents: ["Ironwall"], Attributes: ["Strength", 1], Condition: ["In Formation"], PreReq:{ Attributes: ["Strength", 6], Skills: ["Spearbearer", 1] } });
SkillDefinition("Assassin",    "Fighter", { EnableEvents: ["Assassin"], Attributes: ["Strength", 1], Condition: ["Duel"],         PreReq:{ Attributes: ["Strength", 6], Skills: ["Swordsman", 1]   } });

// Politican
// Basic
SkillDefinition("Smart",           "Politican", { Attributes: ["Intrigue",   1] });
SkillDefinition("Charismatic",     "Politican", { Attributes: ["Charisma",   1] });
SkillDefinition("Wealthy",         "Politican", { Attributes: ["Income",    25] });
SkillDefinition("Administration",  "Politican", { Attributes: ["Governance", 1] });
// Advanced
SkillDefinition("Shemer",          "Politican", { Attributes: ["ActionPoints", 1], PreReq:{ Attributes: ["Intrigue", 6]} });
SkillDefinition("Foreign Customs", "Politican", { Attributes: ["Charisma",     1], Condition: ["Foreign"], PreReq:{ Attributes: ["Charisma", 6], Skills: ["Scholar", 1]} });
SkillDefinition("Seduction",       "Politican", { EnableEvents: ["Seduction"], PreReq:{ Attributes: ["Charisma", 6]} });

// General
// Social
SkillDefinition("Socializer",    "Social", { EnableEvents: ["Socializer"] });
SkillDefinition("Scholar",       "Social", { SameTraitRespect: 1 });
SkillDefinition("Street Smarts", "Social", { SameTraitRespect: 1 });
// Personality
SkillDefinition("Inspiration" , "Personality", { EnableEvents: ["Inspiration" ], Attributes: ["Charisma", 1] });
SkillDefinition("Intimidation", "Personality", { EnableEvents: ["Intimidation"], Attributes: ["Charisma", 1] });
SkillDefinition("Willpower"   , "Personality", { EnableEvents: ["Heroism"],      Attributes: ["Strength", 2], Condition: ["In Danger"] });
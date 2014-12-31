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
SkillDefinition("Berserker",   "Fighter", { EnableEvents: ["Berserker"],                                                          PreReq:{ Attributes: ["Strength", 6], Traits: ["Wrath"]          } });
SkillDefinition("Ironwall",    "Fighter", { EnableEvents: ["Ironwall"], Attributes: ["Strength", 2], Condition: ["In Formation"], PreReq:{ Attributes: ["Strength", 6], Skills: ["Spearbearer", 1] } });
SkillDefinition("Assassin",    "Fighter", { EnableEvents: ["Assassin"], Attributes: ["Strength", 2], Condition: ["Duel"],         PreReq:{ Attributes: ["Strength", 6], Skills: ["Swordsman", 1]   } });

// Politican
// Basic
SkillDefinition("Smart",           "Politican", { Attributes: ["Intrigue",   2] });
SkillDefinition("Charismatic",     "Politican", { Attributes: ["Charisma",   2] });
SkillDefinition("Wealthy",         "Politican", { Attributes: ["Income",    25], PreReq:{ Skills: ["Charismatic", 1]} });
SkillDefinition("Administration",  "Politican", { Attributes: ["Governance", 1], PreReq:{ Skills: ["Smart",       1]} });
// Advanced
SkillDefinition("Shemer",          "Politican", { Attributes: ["ActionPoints", 1], PreReq:{ Attributes: ["Intrigue", 6]} });
SkillDefinition("Foreign Customs", "Politican", { Attributes: ["Charisma",     3], Condition: ["Foreign"], PreReq:{ Attributes: ["Charisma", 6], Skills: ["Scholar", 1]} });
SkillDefinition("Seduction",       "Politican", { EnableEvents: ["Seduction"], PreReq:{ Attributes: ["Charisma", 6]} });

// General
// Social
SkillDefinition("Socializer",    "Social", { EnableEvents: ["Socializer"] });
SkillDefinition("Scholar",       "Social", { SameTraitRespect: 1 });
SkillDefinition("Street Smarts", "Social", { SameTraitRespect: 1 });
// Personality
SkillDefinition("Inspiration" , "Personality", { EnableEvents: ["Inspiration" ], Attributes: ["Charisma", 1], PreReq:{ Attributes: ["Charisma", 4]} });
SkillDefinition("Intimidation", "Personality", { EnableEvents: ["Intimidation"], Attributes: ["Charisma", 1], PreReq:{ Attributes: ["Charisma", 4]} });
SkillDefinition("Willpower"   , "Personality", { EnableEvents: ["Heroism"],      Attributes: ["Strength", 3], Condition: ["In Danger"] });
var Skills = {};
var SkillsArray = [];

function SkillDefinition(name, skill)
{
	skill.Name = name;
	Skills[skill.Name] = skill;
	SkillsArray.push(skill);
}

SkillDefinition("Inspiration",      {Tags: ["Personality"], EnableEvents: ["Inspiration"]});
SkillDefinition("Intimidation",     {Tags: ["Personality"], EnableEvents: ["Intimidation"]});

SkillDefinition("Siege Expert",     {Tags: ["Tactican"], Effects: [{Type: "Tactics", Effect:1.0, If: ["Sieging"  ]}] });
SkillDefinition("Mountain Tactics", {Tags: ["Tactican"], Effects: [{Type: "Tactics", Effect:1.0, If: ["Mountains"]}] });
SkillDefinition("Barricading",      {Tags: ["Tactican"], Effects: [{Type: "Tactics", Effect:1.0, If: ["Defending"]}] });
SkillDefinition("Ambusher",         {Tags: ["Tactican"], EnableEvents: ["Ambusher"]});
SkillDefinition("Logistics",        {Tags: ["Tactican"], Effects: [{Type: "MovementRate", Effect:1.0}]});

SkillDefinition("Swordsman",        {Tags: ["Fighter"], Effects: [{Type: "Combat", Effect:0.5, If: ["Duel"]}, {Type: "Combat", Effect:0.5, IfNot: ["In Formation"]}]});
SkillDefinition("Spearbearer",      {Tags: ["Fighter"], Effects: [{Type: "Combat", Effect:0.5, If: ["Charging"]}, {Type: "Combat", Effect:0.5, If: ["In Formation"]}]});
SkillDefinition("Archery",          {Tags: ["Fighter"], EnableEvents: ["Archery"]});
SkillDefinition("Berserker",        {Tags: ["Fighter"], EnableEvents: ["Berserker"]});
SkillDefinition("Ironwall",         {Tags: ["Fighter"], EnableEvents: ["Ironwall"], Effects: [{Type: "Combat", Effect:0.5, If: ["In Formation"]}]});
SkillDefinition("Assassin",         {Tags: ["Fighter"], EnableEvents: ["Assassin"], Effects: [{Type: "Combat", Effect:0.5, If: ["Duel"]}]});

SkillDefinition("Persuasion",       {Tags: ["Politican"], Effects: [{Type: "Charisma",   Effect:1.0, If: ["Persuading"]}]});
SkillDefinition("Administrator",    {Tags: ["Politican"], Effects: [{Type: "Governance", Effect:1.0}]});
SkillDefinition("Shemer",           {Tags: ["Politican"], Effects: [{Type: "PlotIncome", Effect:1.0}]});
SkillDefinition("Socializer",       {Tags: ["Politican", "Social"], EnableEvents: ["Socializer"]});
SkillDefinition("Scholar",          {Tags: ["Politican", "Social"], SameTraitRespect: 1.0});

SkillDefinition("Street Smarts",    {Tags: ["Social"], SameTraitRespect: 1.0});
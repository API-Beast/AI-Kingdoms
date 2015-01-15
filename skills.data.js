"use strict";

var Skills = {};
var SkillsArray = [];

var Traits      = {};
var TraitsArray = [];

function RequestData()
{
	Backend.LoadText("Data/Skills.xini", "Skills.xini");
	Backend.LoadText("Data/Traits.xini", "Traits.xini");
}

function LoadData()
{
	var definitions = {Skills: [], Traits: []};
	XINI.parse(Backend.Assets["Skills.xini"], definitions);
	XINI.parse(Backend.Assets["Traits.xini"], definitions);

	for(var i = 0; i < definitions.Skills.length; i++)
	{
		var skill = new Skill(definitions.Skills[i]);
		Skills[skill.Name] = skill;
		SkillsArray.push(skill);
	};
	for(var i = 0; i < definitions.Traits.length; i++)
	{
		var skill = new Skill(definitions.Traits[i]);
		Traits[skill.Name] = skill;
		TraitsArray.push(skill);
	};
}
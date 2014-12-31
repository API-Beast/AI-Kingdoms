"use strict";

var Effect = function(template)
{
	this.Attributes   = [];
	this.EnableEvents = [];
	this.Condition    = [];
	this.LevelFactor  = [0, 1, 2, 4, 6, 10];

	if(template)
	for(var key in template)
	if(template.hasOwnProperty(key))
		this[key] = template[key];
}

Effect.prototype.apply = function(level, attr, extraEvents)
{
	if(this.Attributes)
	for(var i = 0; i < this.Attributes.length; i+=2)
	{
		var name = this.Attributes[i];
		var bonus = this.Attributes[i+1] * this.LevelFactor[level];
		attr[name] += bonus;
	};
	if(this.EnableEvents)
	for(var i = 0; i < this.EnableEvents.length; i++)
	{
		var key = this.EnableEvents[i];
		if(!extraEvents.hasOwnProperty(key))
			extraEvents[key]  = level;
		else
			extraEvents[key] += level;
	}
};

Effect.prototype.conditionsFulfilled = function(level, attr, situation)
{
	return this.isStatic(); /*TODO*/
};

Effect.prototype.isStatic = function()
{
	return this.Condition.length == 0;
};

Effect.prototype.getDescription = function(level)
{
	var result = "";
	var intend = "";
	if(this.Condition.length > 0)
	{
		result = "While "+ this.Condition.join(" and ") +":<br>";
		intend = "  ";
	}
	if(this.Attributes)
	for(var i = 0; i < this.Attributes.length; i+=2)
	{
		var name = this.Attributes[i];
		var bonus = this.Attributes[i+1] * this.LevelFactor[level];
		result += intend+"+ "+bonus+" "+name+"<br>";
	};
	if(this.EnableEvents)
	for(var i = 0; i < this.EnableEvents.length; i++)
	{
		result += intend+this.EnableEvents[i]+" Events +"+level+"<br>";
	}
	return result;
};
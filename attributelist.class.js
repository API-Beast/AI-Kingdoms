"use strict";

var AttributeList = function()
{
	this.Base    = {};
	this.Static  = {};
	this.Dynamic = {};
}

AttributeList.prototype.get = function(name)
{
	if(this.Dynamic.hasOwnProperty(name))
		return this.Dynamic[name];
	else
		return 0;
};

AttributeList.prototype.setBase = function(name, value)
{
	return this.Base[name] = value;
};

AttributeList.prototype.resetStatic = function()
{
	this.Static = ShallowCopy(this.Base);
};

AttributeList.prototype.resetDynamic = function()
{
	this.Dynamic = ShallowCopy(this.Static);
};
"use strict";

var Data = {};
Data.CityNamePrefixes = ["Tai", "Nan", "Xiann", "Gan", "Xiam", "Chu", "Zhang", "Jang", "Jingx", "Gying", "Sheng",
        								 "Hang", "Shuang", "Quan", "Zaozhou", "Xian", "Ling", "Chan", "Taian", "Bin", "Fang",
           							 "Shan", "Jiang", "Put", "Chu", "Ye", "Hui", "Liao"];
Data.CityNameSuffixes = ["hou", "yi", "jinh", "ai", "shai", "gou", "gao", "lang", "mati", "kou"];
Data.Faction = {};
Data.Faction.MinorColors = [[151,39,137], [55,95,26], [167,28,14], [37,38,54], [61,79,179], [129,46,75], [117,71,16], [52,86,134], [65,36,88],
                            [72,31,16], [26,82,92], [73,67,15], [132,31,29], [31,69,36], [121,36,98], [74,28,57], [108,57,133], [162,31,68],
                            [112,67,107], [31,46,84], [63,73,142], [157,32,97], [83,21,33], [153,58,20], [118,59,38], [104,66,166], [134,54,60],
                            [169,32,40], [75,78,110], [129,53,22]];
Data.Faction.MajorColors = [[74,238,129], [219,75,245], [255,62,34], [193,219,5], [81,217,235], [253,51,151], [48,112,253], [226,162,10], [45,126,2]];
Data.Faction.Names       = ["Guang", "Fujian", "Anhui", "Jiangsu", "Shang", "Hubei", "Hunan", "Yunnan", "Qing",
														"Xinji", "Panc", "Ganbold", "Batbayar", "Tanar", "Chujang", "Tushoa", "Kanshao", "Pintau",
														"Xiangsu", "Donbai", "Lendai", "Langtau", "Iowei", "Zenwei", "Veras", "Tindea"];


var Sprites = {
	Mountain:[
		{X: 158, Y: 166, W: 200, H: 140, Type: "Mountain"},
		{X:  31, Y: 306, W: 200, H: 170, Type: "Mountain"},
		{X:  27, Y: 313, W: 200, H: 165, Type: "Mountain"},
		{X: 414, Y: 290, W: 125, H: 193, Type: "Mountain"},
		{X: 230, Y: 310, W: 183, H: 155, Type: "Mountain"},
		{X:  41, Y: 502, W: 170, H: 160, Type: "Mountain"},
		{X: 282, Y: 683, W: 290, H:  85, Type: "Mountain"}],
	Forest:[
		{X: 579, Y: 631, W: 100, H: 100, Type: "Forest"},
		{X: 682, Y: 631, W: 100, H: 100, Type: "Forest"},
		{X: 784, Y: 631, W: 100, H: 100, Type: "Forest"},
		{X: 883, Y: 631, W: 100, H: 100, Type: "Forest"}]
};

Data.Skills      = {};
Data.SkillsArray = [];

Data.Traits      = {};
Data.TraitsArray = [];

Data.CityTraits      = {};
Data.CityTraitsArray = [];

Data.Attributes      = {};
Data.AttributesArray = [];

var Definitions = {Skills:[], Traits:[], CityTraits:[], Attributes:[]};

function RequestData()
{
	var onFileListLoaded = function(response)
	{
		var fileList = XINI.parse(response).Files;
		var parseDefinition = function(response, numFilesLeft)
		{
			XINI.parse(response, Definitions);
			if(numFilesLeft === 0)
				LoadData();
		};
		Backend.LoadTextFiles("Data/", fileList, parseDefinition);
	};

	Backend.LoadTextFiles("Data/", ["AFileList.xini"], onFileListLoaded);
}

function LoadData()
{
	for(var i = 0; i < Definitions.Skills.length; i++)
	{
		var trait = new Trait(Definitions.Skills[i]);
		Data.Skills[trait.Name] = trait;
		Data.SkillsArray.push(trait);
	};
	for(var i = 0; i < Definitions.Traits.length; i++)
	{
		var trait = new Trait(Definitions.Traits[i]);
		Data.Traits[trait.Name] = trait;
		Data.TraitsArray.push(trait);
	};
	for(var i = 0; i < Definitions.CityTraits.length; i++)
	{
		var trait = new Trait(Definitions.CityTraits[i]);
		Data.CityTraits[trait.Name] = trait;
		Data.CityTraitsArray.push(trait);
	};
	for(var i = 0; i < Definitions.Attributes.length; i++)
	{
		var atr = Definitions.Attributes[i];
		Data.Attributes[atr.Name] = atr;
		Data.AttributesArray.push(atr);
	};
	for(var key in Definitions)
	if(Definitions.hasOwnProperty(key) && key !== "Skills" && key !== "Traits" && key !== "CityTraits" && key !== "Attributes")
		Data[key] = Definitions[key];

	GameLoaded();
}
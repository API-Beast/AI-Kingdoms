"use strict";

function DevelopCity(city)
{
	var giveTraitsByTag = function(tags, numTraits)
	{
		var traits;
		if(typeof tags === 'object')
			traits = Data.CityTraitsArray.filter(function(skill){ return skill.Tags.some(function(t){ return tags.contains(t); }); });
		else
			traits = Data.CityTraitsArray.filter(function(skill){ return skill.Tags.contains(tags); });
		traits = traits.filter(function(skill){ return skill.preReqFulfilled(city); });
		traits = traits.shuffle();

		while(numTraits-- && traits.length)
			city.Traits.add(traits.pop());
	};

	giveTraitsByTag("CityType", 1);
	giveTraitsByTag("Landscape", 1);
	giveTraitsByTag("Structure", RandInt(1, 3));
	city.calcAttributes();
}
"use strict";

var Backend = 
{
	AssetsToLoad: 0,
	Assets: {},
	LoadImage: null,
	LoadText:  null
};

document.onreadystatechange = function ()
{
  var state = document.readyState
  if(state == 'interactive')
  {
  	if(GameInit)
    	GameInit();
  }
  else if(state == 'complete')
  {
  	/*if(GameStart)
    	GameStart();*/
  }
}

Backend.LoadImage = function(src, key)
{
	Backend.AssetsToLoad += 1;

	var finished = function()
	{
		Backend.AssetsToLoad -= 1;
		if(Backend.AssetsToLoad === 0 && GameLoaded)
			GameLoaded();
	}

	var img = new Image();
	img.addEventListener("load",  finished, false);
	img.addEventListener("error", finished, false);
	img.src = src;
	Backend.Assets[key] = img;
}

Backend.LoadText = function(src, key)
{
	Backend.AssetsToLoad += 1;
	Backend.Assets[key] = null;

	var finished = function()
	{
		Backend.Assets[key] = this.responseText;
		Backend.AssetsToLoad -= 1;
		if(Backend.AssetsToLoad === 0 && GameLoaded)
			GameLoaded();
	}

	var request = new XMLHttpRequest();
	request.addEventListener("load", finished, false);
	request.open("GET", src);
	request.send();
}
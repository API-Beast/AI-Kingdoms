"use strict";

var Backend = 
{
	AssetsToLoad: 0,
	Assets: {},
	LoadImage:  null,
	LoadText:   null
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
	}

	var img = new Image();
	img.addEventListener("load",  finished, false);
	img.addEventListener("error", finished, false);
	img.src = src;
	Backend.Assets[key] = img;
}

Backend.LoadTextFiles = function(relPath, src, callback)
{
	var numFiles = src.length;
	for(var i = 0; i < src.length; i++)
	{
		var finished = function()
		{
			numFiles--;
			callback(this.responseText, numFiles, src[i]); 
		}

		var request = new XMLHttpRequest();
		request.addEventListener("load", finished, false);
		request.open("GET", relPath+src[i]);
		request.send();
	};

}
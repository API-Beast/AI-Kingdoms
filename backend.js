ImagesToLoad = 0;
Assets = {};
function LoadImage(src, key)
{
	ImagesToLoad += 1;
	var img = new Image();
	img.addEventListener("load",  function(){ ImagesToLoad -= 1; }, false);
	img.addEventListener("error", function(){ ImagesToLoad -= 1; }, false);
	img.src = src;
	Assets[key] = img;
}
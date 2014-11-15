document.onreadystatechange = function ()
{
  var state = document.readyState
  if(state == 'interactive')
  {
      GameInit();
  }
  else if(state == 'complete')
  {
      GameStart();
  }
}
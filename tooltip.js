"use strict";

var Tooltip =
{
	Element: null,
	Initialize: function()
	{
		Tooltip.Element = document.createElement('div');
		Tooltip.Element.className = "tooltip hidden";
		Tooltip.Element.style.visibility = "hidden";
		document.body.appendChild(Tooltip.Element);
	},
	MouseEnter: function(e)
	{
		if(!Tooltip.Element)
			Tooltip.Initialize();

		Tooltip.Element.innerHTML = e.target.getAttribute("data-tooltip");
		Tooltip.Element.className = "tooltip active";
		Tooltip.Element.style.visibility = "visible";
		Tooltip.MouseMove(e);
	},
	MouseMove: function(e)
	{
		Tooltip.Element.style.zIndex   = 1000;
		Tooltip.Element.style.position = "absolute";
		Tooltip.Element.style.top      = e.clientY+"px";
		Tooltip.Element.style.left     = e.clientX+"px";
	},
	MouseLeave: function(e)
	{
		Tooltip.Element.className = "tooltip hidden";
		Tooltip.Element.style.visibility = "hidden";
		Tooltip.MouseMove(e);
	}
};

function SetTooltip(obj, tooltip)
{
	obj.setAttribute("data-tooltip", tooltip);
	obj.addEventListener("mouseenter", Tooltip.MouseEnter);
	obj.addEventListener("mousemove",  Tooltip.MouseMove);
	obj.addEventListener("mouseleave", Tooltip.MouseLeave);
}
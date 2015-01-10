"use strict";

function RandInt(min, max)
{
  return Math.floor(Math.random() * ((max+1) - min)) + min;
};

function RandBellCurve(min, max, iterations)
{
	if(!iterations) iterations = 10;
	var rand = 0;
	for(var i = 0; i < iterations; i++)
		rand += Math.random();
	rand /= iterations;
	return min + rand * (max - min);
}

function RandFloat(min, max)
{
	return min + Math.random() * (max - min);
}

function RandVec2(min, max)
{
	return {X: RandFloat(min, max), Y: RandFloat(min, max)};
}

function RandAngle()
{
	return RandFloat(0, Math.PI*2);
}

function Vec2Add(p1, p2)
{
	if(typeof(p2) == "number")
		return {X: p1.X + p2, Y: p1.Y + p2};
	else
		return {X: p1.X + p2.X, Y: p1.Y + p2.Y};
}

function Vec2Sub(p1, p2)
{
	if(typeof(p2) == "number")
		return {X: p1.X - p2, Y: p1.Y - p2};
	else
		return {X: p1.X - p2.X, Y: p1.Y - p2.Y};
}

function Vec2Mul(p1, p2)
{
	if(typeof(p2) == "number")
		return {X: p1.X * p2, Y: p1.Y * p2};
	else
		return {X: p1.X * p2.X, Y: p1.Y * p2.Y};
}

function Vec2Div(p1, p2)
{
	if(typeof(p2) == "number")
		return {X: p1.X / p2, Y: p1.Y / p2};
	else
		return {X: p1.X / p2.X, Y: p1.Y / p2.Y};
}

function Vec2Neg(p1)
{
	return {X: -p1.X, Y: -p1.Y};
}

function ArrayAdd(a1, a2)
{
	var copy = [];
	for(var i = 0; i < a1.length; i++)
		copy[i] = a1[i] + a2[i];
	return copy;
}

function ArrayOperate(a1, a2, func)
{
	var copy = [];
	for(var i = 0; i < a1.length; i++)
		copy[i] = func(a1[i], a2[i]);
	return copy;
}

function Vec2Interpolate(p1, p2, factor)
{
	return {X: p1.X * (1.0-factor) + p2.X * factor, Y: p1.Y * (1.0-factor) + p2.Y * factor};
}

function ClrInterpolate(p1, p2, factor)
{
	return [Math.floor(p1[0] * (1.0-factor) + p2[0] * factor), Math.floor(p1[1] * (1.0-factor) + p2[1] * factor), Math.floor(p1[2] * (1.0-factor) + p2[2] * factor)];
}

function ColorIsDark(clr)
{
	var brightness = (0.2126*clr[0] + 0.7152*clr[1] + 0.0722*clr[2]);
	return brightness < 140;
}

function AngleToVec2(angle)
{
	return {X: Math.sin(angle), Y: Math.cos(angle)};
}

function MakeCluster(start, elements, radius, spread, radiusTurbulence)
{
	if(!radiusTurbulence) radiusTurbulence = 0;
	var cluster = [];
	var angle   = RandFloat(0, Math.PI*2);
	for(var i = 0; i < elements; i++)
	{
		cluster[i] = Vec2Add(start, Vec2Mul(AngleToVec2(angle), radius + RandFloat(0, radiusTurbulence)));
		angle+=spread/elements;
	};
	return cluster;
}

function RandSign()
{
	if(Math.random() > 0.5)
		return 1;
	return -1;
}

function SquareDistance(point1, point2)
{
  var xs = point2.X - point1.X;
  var ys = point2.Y - point1.Y;
  return (xs * xs) + (ys * ys);
};

function Distance(point1, point2)
{
  var xs = point2.X - point1.X;
  var ys = point2.Y - point1.Y;
  return Math.sqrt((xs * xs) + (ys * ys));
};

function FractalSubdivideLine(line, force)
{
	var copy = [];
	var i = 0;
	while(i < line.length)
	{
		var x1 = line[i].X;
		var y1 = line[i].Y;
		copy[i*2] = {X: x1, Y: y1};
		if(i < (line.length - 1))
		{
			var x2 = line[i+1].X;
			var y2 = line[i+1].Y;
			var rad = (Distance(line[i], line[i+1])/2) * force;
			copy[i*2+1] = {X: (x1+x2)/2+RandInt(-rad, rad), Y: (y1+y2)/2+RandInt(-rad, rad)};
		}
		i++;
	}
	return copy;
};

function BoxIntersection(a, b)
{
  return !(b.X > a.X+a.W
        || b.X+b.W < a.X
        || b.Y > a.Y+a.H
        || b.Y+b.H < a.Y);
}

function ProximityTestBoxBox(box, listOfBoxes)
{
	for(var i = listOfBoxes.length - 1; i >= 0; i--)
		if(BoxIntersection(box, listOfBoxes[i]))
			return listOfBoxes[i];
	return false;
};

function ProximityTestPointPoint(point, listOfPoints, radius)
{
	var sqRadius = radius * radius;
	for(var i = listOfPoints.length - 1; i >= 0; i--)
		if(SquareDistance(point, listOfPoints[i]) < sqRadius)
			return listOfPoints[i];
	return false;
};

function ProximityTestLinePoint(line, listOfPoints, radius)
{
	var temp;
	for(var i = line.length - 1; i >= 0; i--)
		if(temp = ProximityTestPointPoint(line[i], listOfPoints, radius))
			return temp;
	return false;
};

function ProximityTestLineLine(line, listOfLines, radius)
{
	var temp;
	for(var i = listOfLines.length - 1; i >= 0; i--)
		if(temp = ProximityTestLinePoint(line, listOfLines[i], radius))
			return temp;
	return false;
};

function ProximityTestPointLine(point, listOfLines, radius)
{
	var temp;
	for(var i = listOfLines.length - 1; i >= 0; i--)
		if(temp = ProximityTestPointPoint(point, listOfLines[i], radius))
			return temp;
	return false;
};

function RandomMaleName()
{
	var names = ["Ao", "Bang", "Buwei", "Chao", "Fuling", "Gao", "Guang", 
	             "He", "Hai", "Ershi", "Jizi", "Ju", "Kang", "Long", "Lun", "Mang", "Qi",
	             "Qian", "Qing", "She", "Sheng", "Si", "Tian", "Wan", "Xian", "Xie", "Xin",
	             "Xing", "Yang", "Ying", "Yu", "Yuan", "Yun", "Zhao", "Zheng", "Zhua"];
	return names.randomElement();
};

function RandomFemaleName()
{
	var names = ["Hou", "Ji", "Lihua", "Na", "Zhi", "Ai",
	             "An", "Bo", "Chun", "Fang", "Fen", "He", "Huan", "Jiao", "Lei", "Xiu",
	             "Yin", "Zhen"];
	return names.randomElement();
};

Array.prototype.randomElement = function()
{
    return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.popRandom = function()
{
	var index = Math.floor(Math.random() * this.length);
	var element = this[index];
	this[index] = this[this.length-1];
	this.pop();
	return element;
};

Array.prototype.removeElement = function(ele)
{
	var index = this.indexOf(ele);
	this[index] = this[this.length-1];
	this.pop();
};

Array.prototype.removeDuplicates = function()
{
	var that = this;
	return this.filter(function(item, pos)
	{
    return that.indexOf(item) == pos;
	});
}

Array.prototype.contains = function(value)
{
	return this.indexOf(value) != -1;
};

Array.prototype.max = function( array ){
    return Math.max.apply( Math, array );
};
 
Array.prototype.min = function( array ){
    return Math.min.apply( Math, array );
};

Array.prototype.mapMetadata = function(f, property)
{
	this.forEach(function(o){ o[property] = f.apply(this, [o].concat(arguments)); });
	return this;
};

Array.prototype.reduceTo = function(items, check)
{
	var that = this.filter(check);
	that.length = Math.min(that.length, items);
	return that;
};

function HtmlTableFromArray(array)
{
	var table = document.createElement('table');
	for (var i = 0; i < array.length; i++)
	{
		var subarray = array[i];
		var row = table.insertRow();
		for(var j = 0; j < subarray.length; j++)
		{
			var cell = row.insertCell();
			var text = null;
			if(typeof(subarray[j]) == "object")
				text = subarray[j];
			else
				text = document.createTextNode(subarray[j].toString());
			cell.appendChild(text);
		};
		
	};
	return table;
};

var NeedsRecolorFallback = false;
function RecolorImage(img, color)
{
	try
	{
		var buffer = document.createElement('canvas');
		buffer.width  = img.width;
		buffer.height = img.height;
		var ctx = buffer.getContext('2d');
		ctx.drawImage(img, 0, 0);
		var pixels = ctx.getImageData(0, 0, buffer.width, buffer.height);
	  var d = pixels.data;
	  for(var i=0; i<d.length; i+=4)
	  {
	    d[i+0] = d[i+0] * (color[0] / 255.0);
	    d[i+1] = d[i+1] * (color[1] / 255.0);
	    d[i+2] = d[i+2] * (color[2] / 255.0);
	  }
	  ctx.putImageData(pixels, 0, 0);
  }
  catch(e)
  {
  	NeedsRecolorFallback = true;
  	return img;
  }
	return buffer;
}

function TypeCheck(args, types)
{
	for(var i = 0; i < types.length; i++)
	{
		if(types[i] != "any")
		if(typeof(args[i]) != types[i])
			throw new TypeError("Argument "+i+": Got "+typeof(args[i])+" but expected "+types[i]);
	}
}

function ShallowCopy(obj)
{
	var copy = {};
	for(var key in obj)
	if(obj.hasOwnProperty(key))
		copy[key] = obj[key];
	return copy;
}

function ApplyTemplate(to, template)
{
	if(template)
	for(var key in template)
	if(template.hasOwnProperty(key))
	{
		to[key] = template[key];
	}
	return to;
}

function ApplyTemplateMultiple(to, template, alt)
{
	if(template)
	for(var key in template)
	if(template.hasOwnProperty(key))
	{
		if(to.hasOwnProperty(key))
			to[key] = template[key];
		else
			alt[key] = template[key];
	}
	return to;
}
"use strict";

function xini_parse(str, parent)
{
	// ----------------------------------------------
	// Preparations for parsing strings in Javascript
	// Not specific to XINI
	// ----------------------------------------------
	var i = -1;
	var cur = function(){ return str[i]; };
	var atEnd = function(){ return i >= str.length; };
	var advance = function(f)
	{
		var start = i;
		while(true)
		{
			if(f(cur())) return str.slice(start+1, i).trim();
			if(atEnd()) return str.slice(start+1).trim();
			i++;
		}
	};
	var extractNesting = function(open, close)
	{
		var start = i+1;
		var end = start;
		var nesting = 1;
		var c = str[end];
		while(end < str.length)
		{
			if(c === open)
				nesting++;
			else if(c === close)
				nesting--;
			if(!nesting) break;
			c = str[++end];
		}
		i = end;
		return str.slice(start, end);
	};
	var eq = function(c){ return (function(cc, c) {return cc === c;}).bind({}, c); };

	// --------------------------
	// XINI specific preparations
	// --------------------------
	var isOperator = function(c){ return c === '=' || c === '{' || c === '[' || c === ';' || c === '#';};
	var append     = function(o, k){ if(o[k] === undefined) o[k] = []; var v = new Object({}); o[k].push(v); return v; };
	var toValue    = function(v)
	{
		v = v.trim();
		var f = v[0], l = v.slice(-1);
		// [Arrays], a bit complex due to nested Arrays
		if(f === '[' && l === ']')
		{
			v = v.slice(1, -1);
			var array = [];
			var nesting = [];
			var z = 0;
			var lastValue  = 0;
			var cleanValue = true;
			var closeArray = false;
			var finish = function()
			{
				if(closeArray)
				{
					array.push(v.slice(nesting.pop(), z));
					cleanValue = true;
				}
				else if(nesting.length === 0)
				{
					array.push(v.slice(lastValue, z));
					cleanValue = true;
				}
			};
			while(z < v.length)
			{
				switch(v[z])
				{
				case '[':
				 	if(cleanValue)
				 		nesting.push(z);
				 	break;
				case ']':
					closeArray = true;
					break;
				case ',':
					finish();
					lastValue = z+1;
					break;
				case ' ':
				case '\t':
				case '\n':
					break;
				default:
					closeArray = false;
					cleanValue = false;
					break;
				}
				z++;
			}
			finish();
			return array.map(toValue);
		}
		// "Strings"
		else if(f === '"' && l === '"')
			return v.slice(1, -1);
		// Numbers
		else if(v.match(/^[-+]?([0-9]*\.[0-9]+|[0-9]+)$/))
			return Number(v);
		// Booleans
		else if(v.match(/^(true|yes|on)$/i))
			return true;
		else if(v.match(/^(false|no|off)$/i))
			return false;
		// Strings without quotation marks
		else
			return v.trim();
	}
	var setValue = function(o, k, v)
	{
		var keys = k.split('.');
		for(var x = 0; x < keys.length-1; x++)
		{
			var result = o[keys[x]];
			if(result === undefined)
				result = o[keys[x]] = {};
			o = result;
		}
		o[keys[keys.length - 1]] = v;
	}

	// ----------------
	// High Level Code
	// ----------------
	if(!parent)
		parent = {};
	var context = parent;

	while(!atEnd())
	{
		var key = "", value = "", oper = "";
		key = advance(isOperator);
		oper = cur();
		switch(oper)
		{
			// [ShallowChild]
			case '[':
				key = advance(eq(']'));
				context = append(parent, key);
				break;
			// DeepChild{ [...] }
			case '{':
				xini_parse(extractNesting('{', '}'), append(parent, key));
				break;
			// ; Comment
			case ';':
			case '#':
				advance(eq('\n'));
				break;
			// Key = Value
			case '=':
				value = advance(eq("\n"));
				// Parsing multi line values, the trickiest part in the whole parser.
				// We need to look ahead and decide if it is a extension of the value.
				while(true)
				{
					var j = i;
					i++;
					var enclosed = false;
					var line = advance
					(
						function(c)
						{
							return isOperator(c) || c === '\n';
						}
					);

					var proper = isOperator(cur());
					// Empty line or line with proper syntax:
					// We found the end! Insert the value!
					if(line.length === 0 || proper)
					{
						setValue(context, key, toValue(value));
						i = j;
						break;
					}
					else
					{
						value += '\n';
						value += line.trim();
						j = i;
						if(atEnd())
						{
							setValue(context, key, toValue(value));
							i = j;
							break;
						}
					}
				}
				break;
		}
	}
	return parent;
}

function xini_stringify(obj, intend, prefix, split)
{
	var contains = function(str, values)
	{
		for(var i = 0; i < values.length; i++)
			if(str.indexOf(values[i]) != -1)
				return true;
		return false;
	};
	var getType = function(v)
	{
		var type = "";
		if(typeof v === "object")
		{
			if(Array.isArray(v))
			{
				var containsObjects = false;
				var containsValue   = false;
				for(var i = 0; i < v.length; i++)
				{
					var subt = getType(v[i]);
					if(subt === "object" || subt == "objArray")
						containsObjects = true;
					else
						containsValue = true;
				}
				if(containsValue && !containsObjects)
					return "array";
				if(containsObjects && !containsValue)
					return "objArray";
				if(containsObjects && containsValue)
					return "object"; // Handle like a normal Javascript object
				return "array"; // Empty array.
			}
			else
				return "object";
		}
		return "value";
	};
	var fvalue = function(v)
	{
		if(typeof v === "object" && Array.isArray(v))
		{
			return "["+v.map(fvalue).join(', ')+"]";
		}
		else if(typeof v === "string")
		{
			if(v.length > 10 || contains(v, ['[', '{', '}']) || v.trim() != v)
				v = '"'+v+'"';
			return v;
		}
		else
			return String(v);
	};

	var result = "";
	var subObjBody = "";
	var appendix = [];
	if(!intend) intend = "";
	if(!prefix) prefix = "";

	for(var key in obj)
	{
		if(!obj.hasOwnProperty(key))
			continue;
		var value = obj[key];
		var type = getType(value);
		key = prefix + key;

		if(type === "array" || type === "value")
		{
			result += intend + key + " = " + fvalue(value) + "\n";
		}
		else if(type === "object")
			appendix.push(xini_stringify(value, intend, key+"."));
		else if(type === "objArray")
		{
			for(var i = 0; i < value.length; i++)
			{
				var subObj = value[i];
				var complex = false;

				for(var subKey in subObj)
				{
					if(!subObj.hasOwnProperty(subKey))
						continue;
					var subVal = subObj[subKey];
					if(getType(subVal) === "objArray")
					{
						complex = true;
						break;
					}
				}

				if(complex)
					subObjBody += intend + key + "\n{\n" + xini_stringify(subObj, intend+"  ") + "}\n\n";
				else
					subObjBody += intend + "[" + key + "]\n" + xini_stringify(subObj, intend);
			};
		}

	}

	if(appendix.length != 0)
		result += "\n" + appendix.join('\n');

	if(subObjBody.length != 0)
		result += "\n" + subObjBody;
	
	return result;
}

var XINI =
{
	parse: xini_parse,
	stringify: xini_stringify
};
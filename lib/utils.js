'use strict';

// Add isType methods: isArguments, etc
// TODO: investigate `isFunction` returns false in browser (when try to insert)
// into collection nad passes callback, thats why currently it's omitted
['Arguments', 'String', 'Number', 'Date', 'RegExp'].forEach(
	function(name) {
		exports['is' + name] = function(obj) {
			return toString.call(obj) == '[object ' + name + ']';
		};
	}
);

exports.isFunction = function(obj) {
	return typeof obj == 'function';
};

 exports.isObject = function(obj) {
	return obj === Object(obj);
};

exports.isArray = Array.isArray;

// Safely create a real, live array from anything iterable.
exports.toArray = function(obj) {
	if (!obj) return [];
	if (exports.isArray(obj)) return Array.prototype.slice.call(obj);
	//if (obj.length === +obj.length) return _.map(obj, _.identity);
	return exports.values(obj);
};

exports.noop = function() {};

exports.values = function(obj) {
	var values = [];
	for (var key in obj) if (key in obj) values.push(obj[key]);
	return values;
};

exports.clone = function(obj) {
	return c(obj);
};

// https://gist.github.com/lxyd/2369704
function c(o,i,r){
    if(o && typeof o=="object") {
        r = o instanceof Array ? [] : {};
        for(i in o)
            o.hasOwnProperty(i)?
            r[i] = o[i]===o ? r : c(o[i])
            :0
    }
    return r||o
}

exports.has = function(obj, key) {
	return obj.hasOwnProperty(key);
};

// Internal recursive comparison function for `isEqual`.
var eq = function(a, b, aStack, bStack) {
	// Identical objects are equal. `0 === -0`, but they aren't identical.
	// See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
	if (a === b) return a !== 0 || 1 / a == 1 / b;
	// A strict comparison is necessary because `null == undefined`.
	if (a == null || b == null) return a === b;
	// Unwrap any wrapped objects.
	// if (a instanceof _) a = a._wrapped;
	// if (b instanceof _) b = b._wrapped;
	// Compare `[[Class]]` names.
	var className = toString.call(a);
	if (className != toString.call(b)) return false;
	switch (className) {
		// Strings, numbers, dates, and booleans are compared by value.
		case '[object String]':
			// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
			// equivalent to `new String("5")`.
			return a == String(b);
		case '[object Number]':
			// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
			// other numeric values.
			return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
		case '[object Date]':
		case '[object Boolean]':
			// Coerce dates and booleans to numeric primitive values. Dates are compared by their
			// millisecond representations. Note that invalid dates with millisecond representations
			// of `NaN` are not equivalent.
			return +a == +b;
		// RegExps are compared by their source patterns and flags.
		case '[object RegExp]':
				return a.source == b.source &&
						a.global == b.global &&
						a.multiline == b.multiline &&
						a.ignoreCase == b.ignoreCase;
		}
	if (typeof a != 'object' || typeof b != 'object') return false;
	// Assume equality for cyclic structures. The algorithm for detecting cyclic
	// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	var length = aStack.length;
	while (length--) {
		// Linear search. Performance is inversely proportional to the number of
		// unique nested structures.
		if (aStack[length] == a) return bStack[length] == b;
	}
	// Add the first object to the stack of traversed objects.
	aStack.push(a);
	bStack.push(b);
	var size = 0, result = true;
	// Recursively compare objects and arrays.
	if (className == '[object Array]') {
		// Compare array lengths to determine if a deep comparison is necessary.
		size = a.length;
		result = size == b.length;
		if (result) {
			// Deep compare the contents, ignoring non-numeric properties.
			while (size--) {
				if (!(result = eq(a[size], b[size], aStack, bStack))) break;
			}
		}
	} else {
		// Objects with different constructors are not equivalent, but `Object`s
		// from different frames are.
		var aCtor = a.constructor, bCtor = b.constructor;
		if (aCtor !== bCtor && !(exports.isFunction(aCtor) && (aCtor instanceof aCtor) &&
			exports.isFunction(bCtor) && (bCtor instanceof bCtor))) {
			return false;
		}
		// Deep compare objects.
		for (var key in a) {
			if (exports.has(a, key)) {
				// Count the expected number of properties.
				size++;
				// Deep compare each member.
				if (!(result = exports.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
			}
		}
		// Ensure that both objects contain the same number of properties.
		if (result) {
			for (key in b) {
				if (exports.has(b, key) && !(size--)) break;
			}
			result = !size;
		}
	}
	// Remove the first object from the stack of traversed objects.
	aStack.pop();
	bStack.pop();
	return result;
};

// Perform a deep comparison to check if two objects are equal.
exports.isEqual = function(a, b) {
	return eq(a, b, [], []);
};

exports.freeze = function(obj, deep) {
	Object.freeze(obj);
	if (deep) Object.getOwnPropertyNames(obj).forEach(function(prop) {
		if (
			obj.hasOwnProperty(prop) &&
			obj[prop] !== null &&
			(exports.isObject(obj[prop]) || exports.isFunction(obj[prop])) &&
			!Object.isFrozen(obj[prop])
		) exports.freeze(obj[prop]);
	});
};

// is `str` a string which contains number
exports.isNumberStr = function(str) {
	return exports.isString(str) && !isNaN(Number(str));
};

exports.get = function(obj, path) {
	if (path.indexOf('.') === -1) return obj[path];
	var keys = path.split('.'),
		n = keys.length - 1,
		i = -1;
	do {
		i++;
		var key = keys[i];
		if (!exports.isArray(obj) || exports.isNumberStr(key)) {
			obj = obj[key];
		} else {
			var newObj = [];
			obj.forEach(function(obj) {
				if (key in obj) newObj = newObj.concat(exports.get(obj, key));
			});
			obj = newObj;
		}
	} while (i < n && obj !== undefined);
	return obj;
};

exports.identity = function(value) {
	return value;
};

exports.sortedIndex = function(array, obj, iterator, context) {
	iterator = iterator == null ? exports.identity : iterator;
	var value = iterator.call(context, obj);
	var low = 0, high = array.length;
	while (low < high) {
		var mid = (low + high) >>> 1;
		iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
	}
	return low;
};

exports.indexOf = function(array, item, isSorted) {
	if (array == null) return -1;
	var i = 0, l = array.length;
	if (isSorted) {
		if (typeof isSorted == 'number') {
			i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
		} else {
			i = exports.sortedIndex(array, item);
			return array[i] === item ? i : -1;
		}
	}
	for (; i < l; i++) if (array[i] === item) return i;
	return -1;
};

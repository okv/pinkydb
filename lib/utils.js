'use strict';

// Add isType methods: isArguments, isFunction, etc
['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(
	function(name) {
		exports['is' + name] = function(obj) {
			return toString.call(obj) == '[object ' + name + ']';
		};
	}
);

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
	return JSON.parse(JSON.stringify(obj));
};

'use strict';

var utils = require('../utils');

/**
 * Comparison operators
 */

exports.$eq = function(val, ev) {
	if (!utils.isRegExp(ev) && utils.isObject(ev) && utils.isObject(val)) {
		return utils.isEqual(val, ev);
	} else if (utils.isRegExp(ev)) {
		return exports.$regex(val, ev);
	} else {
		return val == ev;
	}
};
exports.$ne = function(val, ev) { return val != ev; };
exports.$gt = function(val, ev) { return val > ev; };
exports.$gte = function(val, ev) { return val >= ev; };
exports.$lt = function(val, ev) { return val < ev; };
exports.$lte = function(val, ev) { return val <= ev; };
exports.$in = function(val, ev) {
	return ev && utils.isArray(ev) ? ev.some(function(ev) {
		return val == ev;
	}) : false;
};
exports.$nin = function(val, ev) {
	return ev && utils.isArray(ev) ? !ev.some(function(ev) {
		return val == ev;
	}) : false;
};
exports.$regex = function(val, ev) {
	if (!utils.isRegExp(ev)) throw new Error(
		'$regex requires an instance of RegExp'
	);
	return ev.test(val);
};

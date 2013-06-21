'use strict';

var utils = require('../utils');

/**
 * Comparison operators
 */

exports.$eq = function(val, ev) { return val == ev; };
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

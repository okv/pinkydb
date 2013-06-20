'use strict';

var utils = require('./utils');

function expr(query) {
	return objAnd(query);
}

function signle(obj) {
	var key = Object.keys(obj)[0],
		ev = obj[key];
	if (isOperator(key)) {
		return condition(key, ev);
	} else {
		if (utils.isObject(ev) && isConditionObject(ev)) {
			return comparations(key, ev);
		} else {
			return comparation('$eq', key, ev);
		}
	}
}

function objAnd(obj) {
	var keys = Object.keys(obj);
	if (keys.length == 0) {
		return 'true';
	} else if (keys.length == 1) {
		return signle(obj);
	} else {
		return '(' + keys.map(function(key) {
			var en = {};
			en[key] = obj[key];
			return expr(en);
		}).join(' && ') + ')';
	}
}

/**
 * Conditions (logical operators)
 */

var conditionOperators = {
	$or: function(arr) {
		return arrCondition(arr, '||');
	},
	$and: function(arr) {
		return arrCondition(arr, '&&');
	}
};
function condition(name, val) {
	return conditionOperators[name](val);
}

function arrCondition(arr, sep) {
	return '(' + arr.map(function(val) {
		return expr(val);
	}).join(' ' + sep + ' ') + ')';
}

/**
 * Comparison operators
 */

function comparation(name, key, val) {
	if (name in cops === false) {
		throw new Error('Unknown operator `' + name + '`');
	}
	val = JSON.stringify(val);
	return 'compare(obj, "' + key + '", "' + name + '", ' + val + ')';
}

function comparations(key, val) {
	return '(' + Object.keys(val).map(function(operator) {
		return comparation(operator, key, val[operator]);
	}).join(' && ') + ')';
}

var cops = {};
// ev - expected value
cops.$eq = function(val, ev) {return val == ev;};
cops.$ne = function(val, ev) {return val != ev;};
cops.$gt = function(val, ev) {return val > ev;};
cops.$gte = function(val, ev) {return val >= ev;};
cops.$lt = function(val, ev) {return val < ev;};
cops.$lte = function(val, ev) {return val <= ev;};
cops.$in = function(val, ev) {
	return ev && utils.isArray(ev) ? ev.some(function(ev) {
		return val == ev;
	}) : false;
};
cops.$nin = function(val, ev) {
	return ev && utils.isArray(ev) ? !ev.some(function(ev) {
		return val == ev;
	}) : false;
};

function compare(obj, key, operator, ev) {
	var val = ek(obj, key);
	if (utils.isObject(val) && utils.isObject(ev)) {
		return utils.isEqual(val, ev);
	} else if (utils.isArray(val)) {
		return val[operator == '$ne' ? 'every' : 'some'](function(val) {
			return cops[operator](val, ev);
		});
	} else {
		return cops[operator](val, ev);
	}
}

// extract key value from object
function ek(obj, key) {
	return obj[key];
}

function isOperator(key) {
	return /^\$/.test(key);
}

function isConditionObject(obj) {
	return Object.keys(obj).every(function(key) {
		return isOperator(key);
	});
}

function compile(query) {
	return eval(
		'var func = function(obj) {return ' + expr(query) + ';}; func;'
	);
}

exports.compile = compile;

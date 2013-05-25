'use strict';

var utils = require('./utils');

function expr(en) {
	if (utils.isObject(en)) {
		return objAnd(en);
	} else {
		return signle(en);
	}
}

function signle(obj) {
	var key = Object.keys(obj)[0],
		val = obj[key];
	if (isOperator(key)) {
		return condition(key, val);
	} else {
		if (utils.isObject(val)) {
			return comparations(key, val);
		} else {
			return comparation('$eq', key, val);
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
	if (utils.isString(val)) {
		val = '"' + val + '"';
	} else if (utils.isArray(val)) {
		val = '[' + val.join(',') + ']'
	};
	return 'cops["' + name + '"](obj, "' + key + '", ' + val + ')';
}

function comparations(key, val) {
	return '(' + Object.keys(val).map(function(operator) {
		return comparation(operator, key, val[operator]);
	}).join(' && ') + ')';
}

var cops = {};
// exp - expected value
cops.$eq = function(obj, key, exp) {return ek(obj, key) == exp;};
cops.$ne = function(obj, key, exp) {return ek(obj, key) =! exp;};
cops.$gt = function(obj, key, exp) {return ek(obj, key) > exp;};
cops.$gte = function(obj, key, exp) {return ek(obj, key) >= exp;};
cops.$lt = function(obj, key, exp) {return ek(obj, key) < exp;};
cops.$lte = function(obj, key, exp) {return ek(obj, key) <= exp;};
cops.$in = function(obj, key, exp) {
	return exp && utils.isArray(exp) ? exp.indexOf(ek(obj, key)) !== -1 : false;
};


// extract key value from object
function ek(obj, key) {
	return obj[key];
}

function isOperator(key) {
	return /^\$/.test(key);
}

function compile(query) {
	return eval(
		'var func = function(obj) {return ' + expr(query) + ';}; func;'
	);
}

exports.compile = compile;

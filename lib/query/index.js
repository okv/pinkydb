'use strict';

var utils = require('../utils');

/**
 * Common notice:
 * ev - expected value
 * compile time - at this phase we translate query to js source code
 * run time - phase when we execute generated source code
 * all functions prefixed with `gen` (e.g. genQuery) executed at compile time
 */

/**
 * Generate js source code for query
 * @param {Object} query Complex query e.g. {a: 1, {$or: [{b: 'test', c: 2}]}}
 * @returns {String}
 */
function genQuery(query) {
	var keys = Object.keys(query);
	if (keys.length == 0) {
		return 'true';
	} else if (keys.length == 1) {
		var key = Object.keys(query)[0];
		return genExpr(key, query[key]);
	} else {
		return '(' + keys.map(function(key) {
			return genExpr(key, query[key]);
		}).join(' && ') + ')';
	}

	/**
	 * Generate js source code for expression
	 * @param {String} field e.g. `a`
	 * @param {Any} ev expected `field` value
	 * @returns {String}
	 */
	function genExpr(field, ev) {
		if (isOperator(field)) {
			return genCondition(field, ev);
		} else {
			if (utils.isObject(ev) && isConditionObject(ev) && !utils.isRegExp(ev)) {
				return genComparations(field, ev);
			} else {
				return genComparation('$eq', field, ev);
			}
		}

		function isOperator(key) {
			return /^\$/.test(key);
		}

		function isConditionObject(obj) {
			return Object.keys(obj).every(function(key) {
				return isOperator(key);
			});
		}

		function genComparation(operator, field, ev) {
			if (operator in comparisonOperators === false) {
				throw new Error('Unknown operator `' + operator + '`');
			}
			ev = utils.isRegExp(ev) ? ev : JSON.stringify(ev);
			return 'compare(obj, "' + field + '", "' + operator + '", ' + ev + ')';
		}

		function genComparations(field, ev) {
			return '(' + Object.keys(ev).map(function(operator) {
				return genComparation(operator, field, ev[operator]);
			}).join(' && ') + ')';
		}
	}
}


/**
 * Generate js source code for query and conditional `operator` (see
 * description bellow)
 */
var genCondition = (function() {
	var conditionOperators = {};
	conditionOperators.$or = function(arr) {
		return arrCondition(arr, '||');
	};
	conditionOperators.$and = function(arr) {
		return arrCondition(arr, '&&');
	};

	function arrCondition(arr, sep) {
		return '(' + arr.map(function(val) {
			return genQuery(val);
		}).join(' ' + sep + ' ') + ')';
	}

	/**
	 * Generate js source code for `query` using `operator`
	 * @param {String} operator Logical operator e.g. `$or`
	 * @param {Array} query Some query e.g. [{a: 1}, {b: 2}]
	 */
	return function (operator, query) {
		return conditionOperators[operator](query);
	};
})();


/**
 * Comparison operators
 */
var comparisonOperators = {};
comparisonOperators.$eq = function(val, ev) {
	if (!utils.isRegExp(ev) && utils.isObject(ev) && utils.isObject(val)) {
		return utils.isEqual(val, ev);
	} else if (utils.isRegExp(ev)) {
		return comparisonOperators.$regex(val, ev);
	} else {
		return val == ev;
	}
};
comparisonOperators.$ne = function(val, ev) { return val != ev; };
comparisonOperators.$gt = function(val, ev) { return val > ev; };
comparisonOperators.$gte = function(val, ev) { return val >= ev; };
comparisonOperators.$lt = function(val, ev) { return val < ev; };
comparisonOperators.$lte = function(val, ev) { return val <= ev; };
comparisonOperators.$in = function(val, ev) {
	return ev && utils.isArray(ev) ? ev.some(function(ev) {
		return val == ev;
	}) : false;
};
comparisonOperators.$nin = function(val, ev) {
	return ev && utils.isArray(ev) ? !ev.some(function(ev) {
		return val == ev;
	}) : false;
};
comparisonOperators.$regex = function(val, ev) {
	if (!utils.isRegExp(ev)) throw new Error(
		'$regex requires instance of RegExp'
	);
	return ev.test(val);
};


/**
 * Compare value of object key using `operator` with expected value
 * @returns {Boolean}
 */
function compare(obj, key, operator, ev) {
	var val = ek(obj, key);
	if (utils.isArray(val) && !utils.isArray(ev)) {
		return val[operator == '$ne' ? 'every' : 'some'](function(val) {
			return comparisonOperators[operator](val, ev);
		});
	} else {
		return comparisonOperators[operator](val, ev);
	}
}

// extract key value from object
function ek(obj, key) {
	return obj[key];
}

function compile(query) {
	return eval(
		'var func = function(obj) {return ' + genQuery(query) + ';}; func;'
	);
}

exports.compile = compile;

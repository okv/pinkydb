'use strict';

var Db = require('./db').Db;

exports.db = function(params) {
	return new Db(params);
};

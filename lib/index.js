'use strict';

var Client = require('./client').Client;

exports.open = function(params, callback) {
	var client = new Client(params);
	client.open(params, callback);
};

exports.utils = require('./utils');

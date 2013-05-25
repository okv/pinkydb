'use strict';

var utils = require('./utils'),
	Db = require('./db').Db;

function Client() {
	this.dbs = {};
}

Client.prototype.open = function(params, callback) {
	callback = callback || utils.noop;
	this.params = params;
	callback(null, this);
};

Client.prototype.db = function(name) {
	if (name in this.dbs === false) {
		this.dbs[name] = new Db(this.params);
	}
	return this.dbs[name];
};

exports.Client = Client;

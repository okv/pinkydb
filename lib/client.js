'use strict';

var utils = require('./utils'),
	Db = require('./db').Db,
	createStorage = require('./storage').createStorage;

function Client() {
	this.dbs = {};
}

Client.prototype.open = function(params, callback) {
	var self = this;
	callback = callback || utils.noop;
	params = params || {};
	params.storage = params.storage || {};
	params.storage.type = params.storage.type || 'fs';
	this.storage = createStorage(params.storage);
	// load all databases
	this.storage.getDbs(function(err, dbs) {
		if (err) {callback(err); return;}
		dbs.forEach(function(name) {
			var db = self.db(name);
			db.load(function(err) {
				callback(err, self);
			});
		});
		if (!dbs.length) callback(null, self);
	});
};

Client.prototype.db = function(name) {
	if (name in this.dbs === false) {
		this.dbs[name] = new Db(name, this.storage);
	}
	return this.dbs[name];
};

exports.Client = Client;

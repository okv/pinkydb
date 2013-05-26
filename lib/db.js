'use strict';

var Collection = require('./collection').Collection;

function Db(name, params) {
	params = params || {};
	params.storage = params.storage || {};
	params.storage.type = params.storage.type || 'fs';
	this.name = name;
	this.collections = {};
	this.storage = this._createStorage(params.storage);
}

Db.prototype._createStorage = function(params) {
	try {
		var Storage = require('./storage/' + params.type).Storage;
		return new Storage(params);
	} catch(err) {
		err.message =
			'Can`t load storage by type: `' + params.type + '`: ' + err.message;
		throw err;
	}
};

Db.prototype.collection = function(name) {
	var self = this;
	if (name in self.collections === false) {
		self.collections[name] = new Collection(name);
		self.storage.loadCollection(self, self.collections[name]);
		self.collections[name].on('afterInsert', function(params, done) {
			self.storage.saveCollection(self, self.collections[name], done);
		});
		self.collections[name].on('afterUpdate', function(params, done) {
			self.storage.saveCollection(self, self.collections[name], done);
		});
	}
	return this.collections[name];
};

exports.Db = Db;

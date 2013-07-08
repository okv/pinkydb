'use strict';

var Collection = require('./collection').Collection,
	createStorage = require('./storage').createStorage;

function Db(name, params) {
	params = params || {};
	params.storage = params.storage || {};
	params.storage.type = params.storage.type || 'fs';
	this.name = name;
	this.collections = {};
	this.storage = createStorage(params.storage);
}

Db.prototype.collection = function(name) {
	var self = this;
	if (name in self.collections === false) {
		self.collections[name] = new Collection(name);
		self.storage.loadCollection(self, self.collections[name], function(err) {
			self.collections[name]._setLoaded(!err, err);
		});
		self.collections[name].on('afterInsert', function(params, done) {
			self.storage.saveCollection(self, self.collections[name], done);
		});
		self.collections[name].on('afterUpdate', function(params, done) {
			self.storage.saveCollection(self, self.collections[name], done);
		});
		self.collections[name].on('afterRemove', function(params, done) {
			self.storage.saveCollection(self, self.collections[name], done);
		});
	}
	return this.collections[name];
};

exports.Db = Db;

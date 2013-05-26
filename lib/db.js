'use strict';

var Collection = require('./collection').Collection,
	Storage = require('./storage/fs').Storage;

function Db(name, params) {
	params = params || {};
	params.storage = params.storage || {};
	this.name = name;
	this.collections = {};
	this.storage = new Storage(params.storage.path);
}

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

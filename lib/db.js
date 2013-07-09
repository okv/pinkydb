'use strict';

var Collection = require('./collection').Collection;

function Db(name, storage) {
	this.name = name;
	this.storage = storage;
	this.collections = {};
}

Db.prototype.load = function(callback) {
	var self = this;
	self.storage.getCollections(self.name, function(err, collections) {
		if (err) {callback(err); return;}
		collections.forEach(function(name) {
			var collection = self.collection(name),
				loadedCollections = 0;
			self.storage.loadCollection(self.name, name, function(err, docs) {
				if (err) {callback(err);}
				// tranform documents to hash by `_id` and set to collection
				docs.forEach(function(doc) {
					collection._indexes._id[doc._id] = doc;
					if (doc._id > collection._idSeq) collection._idSeq = doc._id;
				});
				loadedCollections++;
				if (loadedCollections == collections.length) callback();
			});
		});
		if (!collections.length) callback();
	});
};

Db.prototype.collection = function(name) {
	var self = this;
	if (name in self.collections === false) {
		self.collections[name] = new Collection(name);
		['afterInsert', 'afterUpdate', 'afterRemove'].forEach(function(action) {
			self.collections[name].on(action, function(params, done) {
				self.storage.saveCollection(
					self.name, name, self.collections[name].getJSON(), done
				);
			});
		});
	}
	return this.collections[name];
};

exports.Db = Db;

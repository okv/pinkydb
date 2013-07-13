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
		var loadedCollections = 0;
		collections.forEach(function(name) {
			var collection = self.collection(name);
			self.storage.readDocs(self.name, name, function(err, docs) {
				if (err) {callback(err);}
				collection._setDocs(docs);
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
		self.collections[name] = new Collection(self, name);
		['afterInsert', 'afterUpdate', 'afterRemove'].forEach(function(action) {
			self.collections[name].on(action, function(params, done) {
				self.storage.writeDocs(
					self.name, name, self.collections[name]._getDocs(), done
				);
			});
		});
	}
	return this.collections[name];
};

exports.Db = Db;

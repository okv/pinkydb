'use strict';

function Memory(params) {
};

Memory.prototype.getDbs = function(callback) {
	callback(null, []);
};

Memory.prototype.getCollections = function(db, callback) {
	callback(null, []);
};

Memory.prototype.saveCollection = function(db, collection, docs, callback) {
	callback();
};

Memory.prototype.loadCollection = function(db, collection, callback) {
	callback(null, []);
};

exports.Storage = Memory;

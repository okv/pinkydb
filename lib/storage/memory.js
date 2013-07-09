'use strict';

function Storage(params) {
};

Storage.prototype.getDbs = function(callback) {
	callback(null, []);
};

Storage.prototype.getCollections = function(db, callback) {
	callback(null, []);
};

Storage.prototype.saveCollection = function(db, collection, docs, callback) {
	callback();
};

Storage.prototype.loadCollection = function(db, collection, callback) {
	callback(null, []);
};

exports.Storage = Storage;

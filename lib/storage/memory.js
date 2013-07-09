'use strict';

function Storage(params) {
};

Storage.prototype.getDbs = function(callback) {
	callback(null, []);
};

Storage.prototype.getCollections = function(db, callback) {
	callback(null, []);
};

Storage.prototype.writeDocs = function(db, collection, docs, callback) {
	callback();
};

Storage.prototype.readDocs = function(db, collection, callback) {
	callback(null, []);
};

exports.Storage = Storage;

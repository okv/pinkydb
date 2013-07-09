'use strict';

function Storage(params) {
};

Storage.prototype.getDbs = function(callback) {
	callback(null, []);
};

Storage.prototype.getCollections = function(dname, callback) {
	callback(null, []);
};

Storage.prototype.writeDocs = function(dname, cname, docs, callback) {
	callback();
};

Storage.prototype.readDocs = function(dname, cname, callback) {
	callback(null, []);
};

exports.Storage = Storage;

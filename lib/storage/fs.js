'use strict';

var fs = require('fs'),
	path = require('path');

function Storage(params) {
	params = params || {};
	if (!params.path) throw new Error('`path` for storage is not set');
	this.path = params.path;
	if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
};

Storage.prototype.getDbs = function(callback) {
	fs.readdir(this.path, callback);
};

Storage.prototype.getCollections = function(db, callback) {
	fs.readdir(path.join(this.path, db), callback);
};

Storage.prototype.saveCollection = function(db, collection, docs, callback) {
	var dbPath = path.join(this.path, db);
	if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);
	var collectionPath = path.join(dbPath, collection);
	fs.writeFile(
		collectionPath,
		JSON.stringify(docs, null, 4),
		callback
	);
};

Storage.prototype.loadCollection = function(db, collection, callback) {
	var collectionPath = path.join(this.path, db, collection);
	if (!fs.existsSync(collectionPath)) {callback(null, []); return;}
	fs.readFile(collectionPath, function(err, text) {
		callback(err, err || JSON.parse(text));
	});
};

exports.Storage = Storage;

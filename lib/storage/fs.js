'use strict';

var fs = require('fs'),
	path = require('path');

function Fs(params) {
	params = params || {};
	if (!params.path) throw new Error('`path` for storage is not set');
	this.path = params.path;
	if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
};

Fs.prototype.getDbPath = function(db) {
	return path.join(this.path, db.name);
};

Fs.prototype.getCollectionPath = function(db, collection) {
	return path.join(this.getDbPath(db), collection.name + '.json');
};

Fs.prototype.saveCollection = function(db, collection, callback) {
	var dbPath = this.getDbPath(db);
	if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);
	// tranform documents to array before store them
	var docs = [];
	for (var _id in collection._indexes._id) {
		docs.push(collection._indexes._id[_id]);
	}
	// write
	fs.writeFile(
		this.getCollectionPath(db, collection),
		JSON.stringify(docs, null, 4),
		callback
	);
};

Fs.prototype.loadCollection = function(db, collection) {
	if (!fs.existsSync(this.getDbPath(db))) return [];
	var collectionPath = this.getCollectionPath(db, collection);
	if (!fs.existsSync(collectionPath)) return [];
	var text = fs.readFileSync(collectionPath);
	// tranform documents to hash by `_id` and set to collection
	JSON.parse(text).forEach(function(doc) {
		collection._indexes._id[doc._id] = doc;
		if (doc._id > collection._idSeq) collection._idSeq = doc._id;
	});
};

exports.Storage = Fs;

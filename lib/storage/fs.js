'use strict';

var fs = require('fs'),
	path = require('path');

function Fs(path) {
	if (!path) throw new Error('`path` for storage is not set');
	this.path = path;
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

Fs.prototype.loadCollection = function(db, collection, callback) {
	if (!fs.existsSync(this.getDbPath(db))) callback(null, []);
	fs.readFile(this.getCollectionPath(db, collection), function(err, text) {
		if (err) {callback(err); return;}
		callback(null, JSON.parse(text));
	});
};

exports.Storage = Fs;

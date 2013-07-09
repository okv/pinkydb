'use strict';

var store = {};

function Storage(params) {
	params = params || {};
	params.path = params.path || 'default';
	if (params.path in store === false) store[params.path] = {};
	this._dbs = store[params.path];
};

Storage.prototype.getDbs = function(callback) {
	callback(null, Object.keys(this._dbs));
};

Storage.prototype.getCollections = function(dname, callback) {
	if (dname in this._dbs === false) this._dbs[dname] = {};
	callback(null, Object.keys(this._dbs[dname]));
};

Storage.prototype.writeDocs = function(dname, cname, docs, callback) {
	if (dname in this._dbs === false) this._dbs[dname] = {};
	if (cname in this._dbs[dname]) this._dbs[dname][cname] = {};
	this._dbs[dname][cname] = docs;
	callback();
};

Storage.prototype.readDocs = function(dname, cname, callback) {
	callback(null, this._dbs[dname][cname]);
};

exports.Storage = Storage;

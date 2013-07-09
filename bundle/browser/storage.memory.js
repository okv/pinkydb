require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({"./memory":[function(require,module,exports){
module.exports=require('y+e9lg');
},{}],"y+e9lg":[function(require,module,exports){
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

},{}]},{},[])
;
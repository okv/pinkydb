'use strict';

var compileQuery = require('./query').compile;

function Collection() {
	this._objs = [];
}

Collection.prototype.insert = function(obj) {
	this._objs.push(obj);
};

Collection.prototype.find = function(query, projection) {
	var mathcer = compileQuery(query);
	return this._objs.filter(function(obj) {
		return mathcer(obj);
	});
};

exports.Collection = Collection;

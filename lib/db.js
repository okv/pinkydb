'use strict';

var Collection = require('./collection').Collection;

function Db() {
	this.collections = {};
}

Db.prototype.collection = function(name) {
	if (name in this.collections === false) {
		this.collections[name] = new Collection();
	}
	return this.collections[name];
};

exports.Db = Db;

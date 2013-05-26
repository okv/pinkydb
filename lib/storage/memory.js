'use strict';

function Memory(params) {
};

Memory.prototype.saveCollection = function(db, collection, callback) {
	callback();
};

Memory.prototype.loadCollection = function(db, collection) {
	return [];
};

exports.Storage = Memory;

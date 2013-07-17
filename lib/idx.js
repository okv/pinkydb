'use strict';

var utils = require('./utils');

function Idx(params) {
	var knownParams = {'unique': 1, 'immutable': 1};
	for (var param in params) {
		if (param in knownParams === false) throw new Error(
			'Unknown param `' + param + '`'
		);
		this[param] = param;
	}
	this.keys = [];
	this.values = [];
}

Idx.prototype.indexOf = function(key) {
	return utils.indexOf(this.keys, key, true);
};

Idx.prototype.push = function(key, value) {
	var idx = this.indexOf(key);
	if (~idx) {
		if (this.unique) throw new Error(
			'Unique violation for key `' + key + '`: ' + value
		);
		this.values[idx].push(value);
	} else {
		idx = utils.sortedIndex(this.keys, key);
		this.keys.splice(idx, 0, key);
		this.values.splice(idx, 0, value);
	}
};

Idx.prototype.remove = function(key, value) {
	var idx = this.indexOf(key);
	if (~idx) {
		if (this.unique) throw new Error(
			'Unique violation for key `' + key + '`: ' + value
		);
		var vidx = utils.indexOf(this.values[idx], value);
		if (~vidx) {
			if (this.values[idx].length > 1) {
				this.values[idx].splice(vidx, 1);
			} else {
				this.keys.splice(idx, 1);
				this.values.splice(idx, 1);
			}
		} else {
			throw new Error(
				'Can`t remove unexisted value `' + value + '` key `' + key + '`'
			);
		}
	} else {
		throw new Error('Can`t remove unexisted key `' + key + '`');
	}
};

Idx.prototype.get = function(keys) {
	var self = this;
	var values = [];
	keys.forEach(function(key) {
		var idx = self.indexOf(key);
		if (~idx) values = values.concat(self.values[idx]);
	});
	return values;
};

exports.Idx = Idx;

'use strict';

var compileQuery = require('./query').compile,
	utils = require('./utils'),
	util = require('util'),
	Cursor = require('./cursor').Cursor,
	Hook = require('./hook').Hook;

/**
 * Collection
 *
 * Notice: utils.clone used for unlink documentss from database
 */

function Collection(name) {
	Hook.apply(this);
	this.name = name;
	this._idSeq = 0;
	this._indexes = {_id: {}};
}

util.inherits(Collection, Hook);

Collection.prototype.nextId = function() {
	this._idSeq++;
	return this._idSeq;
};

Collection.prototype.insert = function(docs) {
	var self = this,
		args = utils.toArray(arguments),
		options = utils.isObject(args[1]) ? args[1] : {},
		arg1or2 = args[1] || args[2],
		callback = utils.isFunction(arg1or2) ? arg1or2 : utils.noop;
	docs = utils.clone(docs);
	if (!utils.isArray(docs)) docs = [docs];
	docs.forEach(function(doc) {
		if ('_id' in doc == false) doc._id = self.nextId();
		if (doc._id in self._indexes._id) {
			callback(new Error('Unique violation `_id`: ' + doc._id));
			return;
		}
		self._indexes._id[doc._id] = doc;
	});
	this.trigger('afterInsert', {}, callback);
};

Collection.prototype.update = function(query, modifier) {
	var self = this,
		args = utils.toArray(arguments),
		options = utils.isObject(args[2]) ? args[2] : {},
		arg2or3 = args[2] || args[3],
		callback = utils.isFunction(arg2or3) ? arg2or3 : utils.noop;
	// FIXME: allow same id
	if ('_id' in modifier) {
		callback(new Error('Can`t change `_id` of document'));
		return;
	}
	this.find(query).toArray(function(err, docs) {
		if (err) {callback(err);return;}
		docs = options.multi ? docs : docs.slice(0, 1);
		docs.forEach(function(doc) {
			// TODO: add support different modifiers like $set
			modifier = utils.clone(modifier);
			modifier._id = doc._id;
			self._indexes._id[doc._id] = modifier;
		});
		self.trigger('afterUpdate', {}, callback);
	});
};

Collection.prototype.find = function(query, callback) {
	var callback = callback || utils.noop,
		docs = this._find(query);
	docs = utils.clone(docs);
	var cursor = new Cursor(docs);
	callback(null, cursor);
	return cursor;
};

Collection.prototype._find = function(query) {
	var callback = callback || utils.noop,
		matcher = utils.isFunction(query) ? query : compileQuery(query),
		docs = [];
	for (var _id in this._indexes._id) {
		var doc = this._indexes._id[_id];
		if (matcher(doc)) docs.push(doc);
	}
	return docs;
};

Collection.prototype.findOne = function(query, callback) {
	var callback = callback || utils.noop;
	this.find(query).toArray(function(err, docs) {
		callback(err, docs && docs.length ? docs[0] : null);
	});
};

exports.Collection = Collection;

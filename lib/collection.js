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

function Collection(db, name) {
	Hook.apply(this);
	this.db = db;
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
	if (!utils.isArray(docs)) docs = [docs];
	var inputDocs = docs;
	docs = utils.clone(docs);
	var errorDuringInsert = false;
	docs.forEach(function(doc, index) {
		if ('_id' in doc == false) doc._id = self.nextId();
		if (doc._id in self._indexes._id) {
			callback(new Error('duplicate key error `_id`: ' + doc._id));
			errorDuringInsert = true;
			return;
		}
		self._indexes._id[doc._id] = doc;
		// set `_id` to input documents
		inputDocs[index]._id = doc._id;
	});
	if (!errorDuringInsert) this.trigger('afterInsert', {}, callback);
};

var updateOperators = {};
updateOperators.$set = function(doc, field, value) {
	if (utils.isArray(doc) && !utils.isNumberStr(field)) throw new Error(
		'can\'t append to array using string field name [' + field + ']'
	);
	doc[field] = value;
};

function isOperator(key) {
	return /^\$/.test(key);
}

Collection.prototype.update = function(query, modifier) {
	var self = this,
		args = utils.toArray(arguments),
		options = !utils.isFunction(args[2]) ? args[2] : {},
		callback = (utils.isFunction(args[2]) ? args[2] : args[3]) || utils.noop;
	if (options.multi) {
		callback(new Error('multi update currently unsupported'));
		return;
	}
	this.find(query).toArray(function(err, docs) {
		if (err) {callback(err);return;}
		docs = options.multi ? docs : docs.slice(0, 1);
		// determine mode
		var isWholeDocUpdate = true;
		for (var firstKey in modifier) {};
		if (isOperator(firstKey)) {
			isWholeDocUpdate = false;
			var notOperators = Object.keys(modifier).filter(function(key) {
				return !isOperator(key);
			});
			if (notOperators.length) {
				callback(new Error(
					'Invalid operator specified: ' + notOperators[0]
				));
				return;
			}
		} else {
			var operators = Object.keys(modifier).filter(isOperator);
			if (operators.length) {
				callback(new Error(
					'field names cannot start with $ [' + operators[0] + ']'
				));
				return;
			}
		}

		// multi update only for operators
		if (isWholeDocUpdate && options.multi) {
			callback(new Error('multi update only works with $ operators'));
			return;
		}

		// update documents
		var updater = null;
		if (isWholeDocUpdate) {
		// whole document update
			var doc = docs[0];
			if ('_id' in modifier && modifier._id != doc._id) {
				callback(new Error('cannot change _id of document'));
				return;
			}
			modifier = utils.clone(modifier);
			modifier._id = doc._id;
			self._indexes._id[doc._id] = modifier;
		} else {
		// update using modifiers
			for (var i = 0; i < docs.length; i++) {
				var doc = self._indexes._id[docs[i]._id];
				for (var operator in modifier) {
					if (operator in updateOperators === false) {
						callback(new Error('Unknown operator `' + operator + '`'));
						return;
					}
					if ('_id' in modifier[operator] && modifier[operator]._id != doc._id) {
						callback(new Error('cannot change _id of document'));
						return;
					}
					for (var field in modifier[operator]) {
						var fieldParts = field.split('.'),
							lastPart = fieldParts.pop();
						var obj = (fieldParts.length ?
							utils.get(doc, fieldParts.join('.')) : doc);
						var value = modifier[operator][field];
						try {
							updateOperators[operator](obj, lastPart, value);
						} catch(err) {
							callback(err);
							return;
						}
					}
				}
			}
		}
		self.trigger('afterUpdate', {}, callback);
	});
};

Collection.prototype.find = function(query, callback) {
	var callback = callback || utils.noop,
		docs = null,
		err = null;
	try {
		docs = this._find(query);
	} catch(error) {
		err = error;
	}
	// console.time('>>> find clone time')
	docs = utils.clone(docs);
	// console.timeEnd('>>> find clone time')
	// console.log('>>> cloned count = ', docs ? docs.length : 0)
	var cursor = new Cursor(err, docs);
	callback(err, cursor);
	return cursor;
};

Collection.prototype._find = function(query) {
	var callback = callback || utils.noop,
		query = query || {},
		matcher = utils.isFunction(query) ? query : compileQuery(query),
		docs = [];
	// console.time('>>> search time')
	for (var _id in this._indexes._id) {
		var doc = this._indexes._id[_id];
		if (matcher.call(doc)) docs.push(doc);
	}
	// console.timeEnd('>>> search time')
	return docs;
};

Collection.prototype.findOne = function(query, callback) {
	var callback = callback || utils.noop;
	this.find(query).toArray(function(err, docs) {
		callback(err, docs && docs.length ? docs[0] : null);
	});
};

Collection.prototype.remove = function(query, callback) {
	var self = this,
		callback = callback || utils.noop;
	this.find(query).toArray(function(err, docs) {
		if (err) {callback(err);return;}
		docs.forEach(function(doc) {
			delete self._indexes._id[doc._id];
		});
		self.trigger('afterRemove', {}, callback);
	});
};

Collection.prototype._setDocs = function(docs) {
	var self = this;
	// tranform documents to hash by `_id` and set to collection
	docs.forEach(function(doc) {
		self._indexes._id[doc._id] = doc;
		if (doc._id > self._idSeq) self._idSeq = doc._id;
	});
};

Collection.prototype._getDocs = function() {
	// tranform documents to array before store them
	var docs = [];
	for (var _id in this._indexes._id) {
		docs.push(this._indexes._id[_id]);
	}
	return docs;
};

exports.Collection = Collection;

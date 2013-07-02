'use strict';

var expect = require('expect.js'),
	utils = require('../lib/utils');

// use mongodb instead of pinkydb
var um = process.env.NODE_USE_MONGODB;
exports.um = um;

exports.connectToDb = function(callback) {
	var	driver = require(!um ? '../lib' : 'mongodb');
	if (!um) {
		driver.open({storage: {path: '/tmp'}}, function(err, client) {
			callback(err, client, driver);
		});
	} else {
		driver.MongoClient.connect('mongodb://localhost:27017', function(err, client) {
			callback(err, client, driver);
		});
	}
};

describe('bootstrap', function() {
	describe('connect', function() {
		it('to ' + (um ? 'mongodb' : 'pinkydb'), function(done) {
			exports.connectToDb(function(err, client, driver) {
				if (err) done(err);
				var db = client.db('pinkydbTest');
				if (!um) {
					exports.collections = {
						fruits: db.collection('fruits'),
						users: db.collection('users')
					};
				} else {
					var Collection = driver.Collection;
					var SeqPkFactory = function () {
						var _id = 0;
						this.createPk = function() {
							return ++_id;
						};
					};
					exports.collections = {
						fruits: new Collection(db, 'fruits', new SeqPkFactory()),
						users: new Collection(db, 'users', new SeqPkFactory())
					};
				}
				done();
			});
		});

	});
});


/**
 * It's monkey patch to refine and extend expect.js lib
 */

var expectProto = expect.Assertion.prototype;

/**
 * Compare arrays as sets (compare arrays regardless of order of their items)
 */
expectProto.equalSet = function(expected) {
	var actual = this.obj;
	if (!actual || !expected) {
		throw new Error('actual or expected not exists');
	}
	this.assert(
		(actual.length == expected.length) && actual.every(function(actual) {
			return expected.some(function(expected) {
				return utils.isEqual(actual, expected);
			});
		}),
		function() {
			return 'expected ' + JSON.stringify(actual) + ' is equal set to ' +
				JSON.stringify(expected);
		},
		function() {
			return 'expected ' + JSON.stringify(actual) + ' is not equal set to ' +
				JSON.stringify(expected);
		});
	return this;
};

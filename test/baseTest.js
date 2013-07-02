'use strict';

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
				var db = client.db('food');
				if (!um) {
					exports.collections = {
						fruits: db.collection('fruits')
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
						fruits: new Collection(db, 'fruits', new SeqPkFactory())
					};
				}
				done();
			});
		});

	});
});


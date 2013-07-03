'use strict';

var baseTest = require('../test/baseTest'),
	testDataPath = '/tmp/pinkydb-benchmark-data',
	fs = require('fs');

describe('collection', function() {
	var users = null,
		docs = null;

	it('get pointers to collections', function(done) {
		users = baseTest.collections.users;
		done();
	});

	it('clean collection', function(done) {
		users.remove({}, done);
	});

	it('load test data', function(done) {
		fs.readFile(testDataPath, function(err, data) {
			if (err) done(err);
			docs = JSON.parse(data);
			done();
		});
	});

	it('batch insert', function(done) {
		users.insert(docs, done);
	});

	describe('find', function() {
		it('by occupation', function(done) {
			users.find({occupation: 'Gaming Manager'}).toArray(done);
		});

		it('by birtday', function(done) {
			users.find({birthday: {
				$gt: new Date('October 01, 1990 00:00:00').getTime(),
				$lt: new Date('October 01, 2000 00:00:00').getTime()
			}}).toArray(done);
		});
	});
});

'use strict';

var expect = require('expect.js'),
	baseTest = require('./baseTest');

// storages for testing
var storages = [{
	type: 'memory'
}, {
	type: 'fs', path: '/tmp/pinkydb'
}];

// generate test data
function generateData() {
	var data = {}, dataDocsCount = 0;
	for (var i = 0; i < 5; i++) {
		var db = 'db' + i;
		data[db] = {};
		for (var j = 0; j < 5; j++) {
			var collection = 'collection' + j;
			data[db][collection] = [];
			for (var k = 0; k < 10; k++) {
				data[db][collection].push({
					db: db, collection: collection, i: i, j: j, k:k
				});
				dataDocsCount++;
			}
		}
	}
	return {db: data, count: dataDocsCount};
}

(baseTest.um ? describe.skip : describe)('storage', function() {

	storages.forEach(function(storage) {
		describe(storage.type, function() {
			var client = null;
			it('open', function(done) {
				baseTest.connectToDb(storage, function(err, _client) {
					if (err) {done(err); return;}
					client = _client;
					done();
				});
			});

			var data = null;
			it('generate test data', function(done) {
				data = generateData();
				done();
			});

			it('clean', function(done) {
				var removedCount = 0,
					totalCount = Object.keys(data.db).reduce(function(memo, db) {
						return memo + Object.keys(data.db[db]).length;
					}, 0);
				for (var db in data.db) {
					for (var collection in data.db[db]) {
						client.db(db).collection(collection).remove(
							{},
							function(err) {
								if (err) {done(err); return;}
								removedCount++;
								if (removedCount == totalCount) done();
							}
						);
					}
				}
			});

			it('insert data', function(done) {
				var insertedCount = 0;
				for (var db in data.db) {
					for (var collection in data.db[db]) {
						client.db(db).collection(collection).insert(
							data.db[db][collection],
							function(err) {
								if (err) {done(err); return;}
								insertedCount += data.db[db][collection].length;
								if (insertedCount == data.count) done();
							}
						);
					}
				}
			});

			it('check that data equal after and before insertion', function(done) {
				var readCount = 0;
				for (var db in data.db) {
					for (var collection in data.db[db]) {
						client.db(db).collection(collection).find().toArray(
							function(err, docs) {
								if (err) {done(err); return;}
								expect(docs).equalSet(data.db[db][collection]);
								readCount += data.db[db][collection].length;
								if (readCount == data.count) done();
							}
						);
					}
				}
			});
		});
	});

});

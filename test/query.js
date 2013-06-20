'use strict';

var expect = require('expect.js'),
	pinkydb = require('../lib');

describe('query', function() {
	var client = null, db = null, fruits = null;
	it('connect to db', function(done) {
		pinkydb.open({storage: {path: '/tmp'}}, function(err, cl) {
			if (err) done(err);
			client = cl;
			db = client.db('food'),
			fruits = db.collection('fruits');
			done();
		});
	});

	it('clean collection', function(done) {
		fruits.remove({}, done);
	});

	// tests documens
	var tdocs = [
		{name: 'apple', price: 5, colors: ['red', 'green']},
		{name: 'pear', price: 7, colors: ['yellow', 'red']},
		{name: 'banana', price: 10, colors: ['yellow', 'green']},
		// document with self defined id
		{_id: 'GRAPE', name: 'grape', price: 13, colors: ['margin', 'green']}
	];

	it('insert test documents', function(done) {
		fruits.insert(tdocs, done);
	});

	var tdocsQueries = {
		'equal to simple value': {
			query: {price: tdocs[0].price},
			result: [tdocs[0]]
		},
		'simple value in array': {
			query: {price: {$in: tdocs.slice(1, 3).map(function(doc) {
				return doc.price;
			})}},
			result: tdocs.slice(1, 3)
		}
	};

	describe('find', function() {
		// generate test for each query from `tdocsQueries`
		Object.keys(tdocsQueries).forEach(function(queryName) {
			it(queryName, function(done) {
				// query defition
				var queryDef = tdocsQueries[queryName];
				fruits.find(queryDef.query).toArray(function(err, docs) {
					if (err) done(err);
					expect(docs).eql(queryDef.result);
					done();
				});
			});
		});
	});
});

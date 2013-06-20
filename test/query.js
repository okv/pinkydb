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

	// tests documens (pprices - previous prices)
	var tdocs = [
		{name: 'apple', price: 5, colors: ['red', 'green'], pprices: [3, 4]},
		{name: 'pear', price: 7, colors: ['yellow', 'red'], pprices: [6]},
		{name: 'banana', price: 10, colors: ['yellow', 'green'], pprices: [8]},
		{name: 'grape', price: 13, colors: ['margin', 'green'], pprices: [9, 10]}
	];

	it('insert test documents', function(done) {
		fruits.insert(tdocs, done);
	});

	var tdocsQueries = {
		'simple value equal to simple value': {
			query: {price: tdocs[0].price},
			result: tdocs.slice(0, 1)
		},
		'array equal to simple value': {
			query: {colors: 'red'},
			result: tdocs.slice(0, 2)
		},
		'simple value not equal to simple value': {
			query: {price: {$ne: tdocs[0].price}},
			result: tdocs.slice(1, 4)
		},
		'array not equal to simple value': {
			query: {colors: {$ne: 'red'}},
			result: tdocs.slice(2, 4)
		},
		'simple value greater then simple value': {
			query: {price: {$gt: tdocs[1].price}},
			result: tdocs.slice(2, 4)
		},
		'array greater then simple value': {
			query: {pprices: {$gt: 6}},
			result: tdocs.slice(2, 4)
		},
		'simple value greater or equal to simple value': {
			query: {pprices: {$gte: 6}},
			result: tdocs.slice(1, 4)
		},
		'array greater or equal to simple value': {
			query: {price: {$gte: tdocs[1].price}},
			result: tdocs.slice(1, 4)
		},
		'simple value less then simple value': {
			query: {price: {$lt: tdocs[1].price}},
			result: tdocs.slice(0, 1)
		},
		'array less then simple value': {
			query: {pprices: {$lt: 6}},
			result: tdocs.slice(0, 1)
		},
		'simple value less or equal then simple value': {
			query: {price: {$lte: tdocs[1].price}},
			result: tdocs.slice(0, 2)
		},
		'array less or equal then simple value': {
			query: {pprices: {$lte: 6}},
			result: tdocs.slice(0, 2)
		},
		'simple value in array': {
			query: {price: {$in: tdocs.slice(1, 3).map(function(doc) {
				return doc.price;
			})}},
			result: tdocs.slice(1, 3)
		},
		'price equal to 5 $or colors contain yellow': {
			query: {$or: [{price: 5}, {colors: 'yellow'}]},
			result: tdocs.slice(0, 3)
		},
		'price equal to 5 $and colors contain green': {
			query: {$and: [{price: 5}, {colors: 'green'}]},
			result: tdocs.slice(0, 1)
		},
		'$and inside $or': {
			query: {$or: [
				{$and: [{price: 5}, {colors: 'green'}]},
				{$and: [{price: 7}, {colors: 'yellow'}]}
			]},
			result: tdocs.slice(0, 2)
		}
	};

	describe('find where', function() {
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

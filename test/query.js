'use strict';

var expect = require('expect.js'),
	baseTest = require('./baseTest');

describe('query', function() {
	var fruits = null;

	it('get pointers to collections', function(done) {
		fruits = baseTest.collections.fruits;
		done();
	});

	it('clean collection', function(done) {
		fruits.remove({}, done);
	});

	/**
	 * Tests documents (`pprices` - previous prices, `add` - additional
	 * parameters)
	 */
	var tdocs = [{
		name: 'apple',
		price: 5,
		pprices: [3, 4],
		add: {
			colors: ['red', 'green']
		}
	}, {
		name: 'pear',
		price: 7,
		pprices: [6],
		add: {
			colors: ['yellow', 'red']
		}
	}, {
		name: 'banana',
		price: 10,
		pprices: [8],
		add: {
			colors: ['yellow', 'green'],
			production: [{
				country: 'India', ratio: 20
			}, {
				country: 'Uganda', ratio: 8
			}, {
				country: 'China', ratio: 7
			}]
		}
	}, {
		name: 'grape',
		price: 13,
		pprices: [9, 10],
		add: {
			colors: ['margin', 'green'],
			production: [{
				country: 'China', ratio: 13
			}, {
				country: 'Italy', ratio: 11
			}, {
				country: 'USA', ratio: 9
			}]
		}
	}, {
		//this document will have only `_id` field
	}];

	it('insert test documents', function(done) {
		fruits.insert(tdocs, done);
	});

	var tdocsQueries = {
		'simple value equal to simple value': {
			query: {price: tdocs[0].price},
			result: tdocs.slice(0, 1)
		},
		'array equal to simple value': {
			query: {pprices: 3},
			result: tdocs.slice(0, 1)
		},
		'array equal to array': {
			query: {pprices: tdocs[0].pprices},
			result: tdocs.slice(0, 1)
		},
		'object equal to object': {
			query: {add: tdocs[2].add},
			result: tdocs.slice(2, 3)
		},
		'simple value not equal to simple value': {
			query: {price: {$ne: tdocs[0].price}},
			result: tdocs.slice(1)
		},
		'array not equal to simple value': {
			query: {pprices: {$ne: 3}},
			result: tdocs.slice(1)
		},
		'object not equal to object': {
			query: {add: {$ne: {colors: ['red', 'green']}}},
			result: tdocs.slice(1)
		},
		'string not equal to regex': {
			query: {
				name: {$ne: /^Appl/i}
			},
			result: tdocs.slice(1),
			// mongodb 2.2.3 doesn`t support this
			skip: baseTest.um
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
		'simple value in simple value (expect error)': {
			query: {price: {$in: 3}},
			result: new Error(
				baseTest.um ? 'invalid query' : '$in/$nin requires an array'
			)
		},
		'array in array': {
			query: {pprices: {$in: [4, 5]}},
			result: tdocs.slice(0, 1)
		},
		'object in array of objects': {
			query: {add: {$in: [tdocs[2].add]}},
			result: tdocs.slice(2, 3)
		},
		'simple value not in array': {
			query: {price: {$nin: tdocs.slice(0, 3).map(function(doc) {
				return doc.price;
			})}},
			result: tdocs.slice(3, 5)
		},
		'simple value not in simple value (expect error)': {
			query: {price: {$nin: 3}},
			result: new Error(
				baseTest.um ? '$nin needs an array' : '$in/$nin requires an array'
			)
		},
		'array not in array': {
			query: {pprices: {$nin: [4, 5]}},
			result: tdocs.slice(1)
		},
		'$or': {
			query: {$or: [{price: 5}, {pprices: {$gt: 4, $lt: 9}}]},
			result: tdocs.slice(0, 3)
		},
		'$and': {
			queries: [{
				$and: [{price: 5}, {pprices: 3}]
			}, {
				price: 5, pprices: 3
			}],
			result: tdocs.slice(0, 1)
		},
		'$and inside $or': {
			query: {$or: [
				{$and: [{price: 5}, {pprices: 3}]},
				{$and: [{price: 7}, {pprices: 6}]}
			]},
			result: tdocs.slice(0, 2)
		},
		'simple value matches to regexp': {
			queries: [{
				name: {$regex: /^Appl/i}
			}, {
				name: /^Appl/i
			}],
			result: tdocs.slice(0, 1)
		},
		'array matches to regexp': {
			queries: [{
				pprices: {$regex: /^3$/}
			}, {
				pprices: /^3$/
			}],
			result: tdocs.slice(0, 1),
			skip: baseTest.um
		},
		'function instead of query': {
			query: function() {
				return ~['apple', 'pear'].indexOf(this.name);
			},
			result: tdocs.slice(0, 2),
			// mongodb 2.2.3/driver 1.3.10 doesn`t support function instead of query
			skip: baseTest.um
		},
		'dot notation array equal simple value': {
			query: {'add.colors': 'red'},
			result: tdocs.slice(0, 2)
		},
		'dot notation array index equal simple value': {
			query: {'add.colors.1': 'red'},
			result: tdocs.slice(1, 2)
		},
		'dot notation property in array of objects equal to simple value': {
			query: {'add.production.country': 'India'},
			result: tdocs.slice(2, 3)
		}
	};

	describe('find where', function() {
		// generate test for each query from `tdocsQueries`
		Object.keys(tdocsQueries).forEach(function(queryName) {
			// queryDef - query defition
			var queryDef = tdocsQueries[queryName];
			// when single test query specified
			if (queryDef.query) {
				(queryDef.skip ? it.skip: it)(queryName, function(done) {
					fruits.find(queryDef.query).toArray(function(err, docs) {
						processResult(err, docs, done);
					});
				});
			} else if (queryDef.queries) {
			// when several test queries specified (all should return same result)
				describe(queryName, function() {
					queryDef.queries.forEach(function(query, index) {
						(queryDef.skip ? it.skip: it)('query ' + index, function(done) {
							fruits.find(query).toArray(function(err, docs) {
								processResult(err, docs, done);
							});
						});
					});
				});
			} else {
				throw new Error(
					'`query` or `queries` should be specified for query defition'
				);
			}

			function processResult(err, docs, done) {
				if (err) {
					if (queryDef.result instanceof Error) {
						expect(queryDef.result.message).equal(err.message);
					} else {
						done(err);
					}
				} else {
					expect(docs).eql(queryDef.result);
				}
				done();
			}
		});
	});
});

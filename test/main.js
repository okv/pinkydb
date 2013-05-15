'use strict';

var expect = require('expect.js'),
	qcompile = require('../lib/query').compile,
	ds = require('../lib');

describe('', function() {

	var obj = {a: 1, b: 2, c: 2, d: 4, e: 10};
	var query = {
		a: 1,
		b: {$in: [1, 2, 3]},
		$or: [{c: 3}, {d: 4}],
		e: {$gte: 10, $lt: 100}
	};
	console.log(query)
	var func = qcompile(query);
	console.log(func.toString());
	console.log(func(obj));
	var db = ds.db(),
		things = db.collection('things');
	things.insert({name: 'apple', color: 'red'});
	things.insert({name: 'banana', color: 'red'});
	things.insert({name: 'aaa', color: 'bbb'});
	console.log(things.find({color: 'red'}))
});

'use strict';

var expect = require('expect.js'),
	qcompile = require('../lib/query').compile,
	ds = require('../lib');

describe('', function() {

	var obj = {a: 1, b: 2, c: 2, d: 4, e: 11};
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
	ds.open({}, function(err, client) {
		var db = client.db('test'),
			things = db.collection('things');
		things.insert([
			{name: 'apple', color: 'red'},
			{name: 'banana', color: 'red'}
		]);
		things.insert({name: 'aaa', color: 'bbb'});
		things.update(
			{name: 'banana'},
			{name: 'banananananna', color: 'red'},
			function(err){
				console.log('>> after update = ', arguments)
			}
		);
		things.findOne({color: 'red'}, function(err, docs) {
			console.log('findOne = ', err, docs);
		});
		things.find({color: 'red'}).toArray(function(err, docs) {
			console.log('find = ', err, docs);
		});
		things.find({color: 'red'}).count(function(err, count) {
			console.log('count = ', err, count);
		});
	});
});

'use strict';

var expect = require('expect.js'),
	qcompile = require('../lib/query').compile,
	pinkydb = require('../lib');

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
	pinkydb.open({storage: {type: 'memory', path: __dirname}}, function(err, client) {
		var db = client.db('test'),
			things = db.collection('things');
		things.insert([
			{name: 'apple', color: 'red'},
			{name: 'banana', color: 'red'}
		], function(err) {
			if (err) throw err;
			things.insert({name: 'aaa', color: 'bbb'}, function(err) {
				if (err) throw err;
				things.update(
					{name: 'banana'},
					{name: 'banananananna', color: 'red'},
					function(err){
						if (err) throw err;
						console.log('>> after update = ', arguments);
						find();
					}
				);
			});
		});

//		find()
		function find() {
			things.findOne({color: 'red'}, function(err, docs) {
				console.log('findOne = ', err, docs);
			});
			things.find({color: 'red'}).toArray(function(err, docs) {
				console.log('find = ', err, docs);
			});
			things.remove({color: 'red'}, function(err) {
				if (err) throw err;
				things.find({color: 'red'}).count(function(err, count) {
					console.log('count = ', err, count);
				});
			});
		}
	});

	it('delay', function(done) {
		setTimeout(done, 50);
	});
});

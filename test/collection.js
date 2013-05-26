'use strict';

var expect = require('expect.js'),
	ds = require('../lib');

describe('except collection', function() {
	var client = null, db = null, fruits = null;
	it('connect to db', function(done) {
		ds.open({storage:{path: '/tmp'}}, function(err, cl) {
			if (err) done(err);
			client = cl;
			db = client.db('food'),
			fruits = db.collection('fruits');
			done();
		});
	});

	describe('insert', function() {
		var apple = null;
		it('single document without errors', function(done) {
			apple = {name: 'apple', price: 5, colors: ['red', 'green']};
			fruits.insert(apple, done);
		});

		var banana = null, pear = null;
		it('batch without errors', function(done) {
			var pear = {name: 'pear', price: 7, colors: ['yellow', 'red']},
				banana = {name: 'banana', price: 10, colors: ['yellow', 'green']};
			fruits.insert([pear, banana], done);
		});
	});

});

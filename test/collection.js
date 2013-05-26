'use strict';

var expect = require('expect.js'),
	ds = require('../lib');

describe('expect collection', function() {
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

	it('clean collection', function(done) {
		fruits.remove({}, done);
	});

	describe('insert', function() {
		var doc = {name: 'apple', price: 5, colors: ['red', 'green']};

		it('single document without errors', function(done) {
			fruits.insert(doc, done);
		});

		it('document has an _id', function(done) {
			expect(doc).have.key('_id');
			expect(doc._id).a('number');
			done();
		});

		var docs = [
			{name: 'pear', price: 7, colors: ['yellow', 'red']},
			{name: 'banana', price: 10, colors: ['yellow', 'green']}
		];

		it('batch without errors', function(done) {
			fruits.insert(docs, done);
		});

		it('documents has an _id', function(done) {
			docs.forEach(function(doc) {
				expect(doc).have.key('_id');
				expect(doc._id).a('number');
			});
			done();
		});

		var docWithId = {
			_id: 'GRAPE', name: 'grape', price: 13, colors: ['margin', 'green']
		};
		it('document with custom _id', function(done) {
			fruits.insert(docWithId, done);
		});

		it('document has same _id after insert', function(done) {
			expect(docWithId).have.key('_id');
			expect(docWithId._id).equal('GRAPE');
			done();
		});
	});

});

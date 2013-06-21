'use strict';

var expect = require('expect.js'),
	pinkydb = require('../lib');

describe('collection', function() {
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

	describe('insert', function() {
		it('single document without errors', function(done) {
			fruits.insert(tdocs[0], done);
		});

		it('document has an _id', function(done) {
			expect(tdocs[0]).have.key('_id');
			expect(tdocs[0]._id).a('number');
			done();
		});

		var batch = tdocs.slice(1, 3);
		it('batch without errors', function(done) {
			fruits.insert(batch, done);
		});

		it('documents has an _id', function(done) {
			batch.forEach(function(doc) {
				expect(doc).have.key('_id');
				expect(doc._id).a('number');
			});
			done();
		});

		var docWithId = tdocs[3];
		it('document with custom _id', function(done) {
			fruits.insert(docWithId, done);
		});

		it('document has same custom _id after insert', function(done) {
			expect(docWithId).have.key('_id');
			expect(docWithId._id).equal('GRAPE');
			done();
		});

		it('expect an error when try to violate unique _id', function(done) {
			fruits.insert(tdocs[0], function(err) {
				expect(err).ok();
				expect(err).a(Error);
				expect(err.message).ok();
				expect(err.message).contain('violation');
				expect(err.message).contain(tdocs[0]._id);
				done();
			});
		});

		it('check that all docuemnts equal to stored documents', function(done) {
			var allDocs = {};
			tdocs.forEach(function(doc){ allDocs[doc._id] = doc; });
			fruits.find({}).toArray(function(err, docs) {
				if (err) done(err);
				docs.forEach(function(doc) {
					expect(allDocs).have.key(String(doc._id));
					expect(allDocs[doc._id]).eql(doc);
				});
				done();
			});
		});
	});

	describe('update', function() {
		it('single whole document', function(done) {
			tdocs[0].name = 'pineapple';
			tdocs[0].price = 15;
			fruits.update({_id: tdocs[0]._id}, tdocs[0], done);
		});

		it('check that updated document equals to stored', function(done) {
			fruits.findOne({_id: tdocs[0]._id}, function(err, doc) {
				if (err) done(err);
				expect(tdocs[0]).eql(doc);
				done();
			});
		});

		it('expect an error when try to change _id', function(done) {
			var id = tdocs[0]._id;
			tdocs[0]._id++;
			fruits.update({_id: id}, tdocs[0], function(err) {
				expect(err).ok();
				expect(err).a(Error);
				expect(err.message).ok();
				expect(err.message).contain('change `_id`');
				done();
			});
			tdocs[0]._id--;
		});

		it('expect that multi update unsupported', function(done) {
			fruits.update({}, tdocs[0], {multi: true}, function(err) {
				expect(err).ok();
				expect(err).a(Error);
				expect(err.message).ok();
				expect(err.message).contain('currently unsupported');
				done();
			});
		});
	});
});

'use strict';

var expect = require('expect.js'),
	pinkydb = require('../lib');

describe('collection', function() {
	var client = null, db = null, fruits = null;
	it('connect to db', function(done) {
		pinkydb.open({storage:{path: '/tmp'}}, function(err, cl) {
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

	var doc = {name: 'apple', price: 5, colors: ['red', 'green']},
		docs = [
			{name: 'pear', price: 7, colors: ['yellow', 'red']},
			{name: 'banana', price: 10, colors: ['yellow', 'green']}
		],
		docWithId = {
			_id: 'GRAPE', name: 'grape', price: 13, colors: ['margin', 'green']
		};

	describe('insert', function() {
		it('single document without errors', function(done) {
			fruits.insert(doc, done);
		});

		it('document has an _id', function(done) {
			expect(doc).have.key('_id');
			expect(doc._id).a('number');
			done();
		});

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

		it('document with custom _id', function(done) {
			fruits.insert(docWithId, done);
		});

		it('document has same custom _id after insert', function(done) {
			expect(docWithId).have.key('_id');
			expect(docWithId._id).equal('GRAPE');
			done();
		});

		it('expect an error when try to violate unique _id', function(done) {
			fruits.insert(doc, function(err) {
				expect(err).ok();
				expect(err).a(Error);
				expect(err.message).ok();
				expect(err.message).contain('violation');
				expect(err.message).contain(doc._id);
				done();
			});
		});

		it('check that all docuemnts equal to stored documents', function(done) {
			var allDocs = {};
			[doc, docWithId].concat(docs).forEach(function(doc){
				allDocs[doc._id] = doc;
			});
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
			doc.name = 'pineapple';
			doc.price = 15;
			fruits.update({_id: doc._id}, doc, done);
		});

		it('check that updated document equals to stored', function(done) {
			fruits.findOne({_id: doc._id}, function(err, sdoc) {
				if (err) done(err);
				expect(doc).eql(sdoc);
				done();
			});
		});

		it('expect an error when try to change _id', function(done) {
			var id = doc._id;
			doc._id++;
			fruits.update({_id: id}, doc, function(err) {
				expect(err).ok();
				expect(err).a(Error);
				expect(err.message).ok();
				expect(err.message).contain('change `_id`');
				done();
			});
			doc._id--;
		});

		it('expect that multi update unsupported', function(done) {
			fruits.update({}, doc, {multi: true}, function(err) {
				expect(err).ok();
				expect(err).a(Error);
				expect(err.message).ok();
				expect(err.message).contain('currently unsupported');
				done();
			});
		});
	});

});

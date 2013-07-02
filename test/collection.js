'use strict';

var expect = require('expect.js'),
	baseTest = require('./baseTest');

describe('collection', function() {
	var fruits = null;

	it('get pointers to collections', function(done) {
		fruits = baseTest.collections.fruits;
		done();
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
				expect(err.message).contain('duplicate key error');
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
				expect(err.message).contain('cannot change _id');
				done();
			});
			tdocs[0]._id--;
		});

		(baseTest.um ? it.skip : it)
		('expect that multi update unsupported', function(done) {
			fruits.update({}, tdocs[0], {multi: true}, function(err) {
				expect(err).ok();
				expect(err).a(Error);
				expect(err.message).ok();
				expect(err.message).contain('currently unsupported');
				done();
			});
		});
	});

	describe('remove', function() {
		var namesToRemove = null,
			docsToRemove = null,
			collectionDocsAfterRemove = null;

		it('find names to remove', function(done) {
			fruits.find({}).skip(1).limit(2).toArray(function(err, docs) {
				if (err) done(err);
				expect(docs).length(2);
				docsToRemove = tdocs.slice(1, 3);
				namesToRemove = docsToRemove.map(function(doc) {
					return doc.name;
				});
				collectionDocsAfterRemove = [tdocs[0], tdocs[3]];
				done();
			});
		});

		it('find documents before remove', function(done) {
			fruits.find({name: {$in: namesToRemove}}).toArray(function(err, docs) {
				if (err) done(err);
				expect(docs).eql(docsToRemove);
				done();
			});
		});

		it('remove documents', function(done) {
			fruits.remove({name: {$in: namesToRemove}}, done);
		});

		it('expect documents can`t be find after remove', function(done) {
			fruits.find({name: {$in: namesToRemove}}).toArray(function(err, docs) {
				if (err) done(err);
				expect(docs).length(0);
				done();
			});
		});

		it('expect collection only 2 documents', function(done) {
			fruits.find().toArray(function(err, docs) {
				if (err) done(err);
				expect(docs).eql(collectionDocsAfterRemove);
				done();
			});
		});

		// simple current storage engine test
		it('new connection should load only 2 document', function(done) {
			baseTest.connectToDb(function(err, client) {
				if (err) done(err);
				var fruits = client.db('food').collection('fruits');
				fruits.find().toArray(function(err, docs) {
					if (err) done(err);
					expect(docs).eql(collectionDocsAfterRemove);
					done();
				});
			});
		});
	});
});

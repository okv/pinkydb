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

		it('clone document', function(done) {
			var price = tdocs[0].price;
			tdocs[0].price = 55;
			fruits.findOne({_id: tdocs[0]._id}, function(err, doc) {
				if (err) {done(err); return;}
				expect(doc).ok();
				expect(doc.price).equal(price);
				tdocs[0].price = price;
			});
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
				if (err) {done(err); return;}
				docs.forEach(function(doc) {
					expect(allDocs).have.key(String(doc._id));
					expect(allDocs[doc._id]).eql(doc);
				});
				done();
			});
		});
	});

	describe('update', function() {
		var repDoc = null;
		it('single whole document', function(done) {
			tdocs[0].name = 'pineapple';
			tdocs[0].price = 15;
			repDoc = tdocs[0];
			fruits.update({_id: tdocs[0]._id}, repDoc, done);
		});

		it('check that updated document equals to stored', function(done) {
			fruits.findOne({_id: tdocs[0]._id}, function(err, doc) {
				if (err) {done(err); return;}
				expect(tdocs[0]).eql(doc);
				done();
			});
		});

		it('clone new replacement document', function(done) {
			var price = tdocs[0].price;
			tdocs[0].price = 55;
			fruits.findOne({_id: tdocs[0]._id}, function(err, doc) {
				if (err) {done(err); return;}
				expect(doc).ok(doc);
				expect(doc.price).equal(price);
				tdocs[0].price = price;
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

		it('expect error when whole doc multi update', function(done) {
			fruits.update({}, tdocs[0], {multi: true}, function(err) {
				expect(err).ok();
				expect(err).a(Error);
				expect(err.message).equal(
					'multi update only works with $ operators'
				);
				done();
			});
		});

		it('multi docs query with `multi` flag updates multi docs', function(done) {
			var amount = 10;
			fruits.update({}, {$inc: {price: amount}}, {multi: true}, function(err) {
				fruits.find().toArray(function(err, docs) {
					if (err) {done(err); return;}
					var tdocsHash = createHash(tdocs, '_id'),
						equalCount = 0;
					docs.forEach(function(doc) {
						if (doc.price === tdocsHash[doc._id].price + amount) {
							equalCount++;
							tdocsHash[doc._id].price += amount;
						}
					});
					expect(equalCount).equal(tdocs.length);
					done();
				});
			});
		});

		it(
			'multi docs query without `multi` flag updates only onde doc',
			function(done) {
				var amount = 10;
				fruits.update({}, {$inc: {price: amount}}, function(err) {
					fruits.find().toArray(function(err, docs) {
						if (err) {done(err); return;}
						var tdocsHash = createHash(tdocs, '_id'),
							equalCount = 0;
						docs.forEach(function(doc) {
							if (doc.price === tdocsHash[doc._id].price + amount) {
								equalCount++;
								tdocsHash[doc._id].price += amount;
							}
						});
						expect(equalCount).equal(1);
						done();
					});
				});
			}
		);

		it('simple field using $set', function(done) {
			var newName = 'updated ' + tdocs[0].name;
			fruits.update(
				{_id: tdocs[0]._id},
				{$set: {name: newName}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[0]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.name).equal(newName);
						done();
						tdocs[0].name = newName;
					});
				}
			);
		});

		it('value in array by index using $set', function(done) {
			var newColor = 'yellow';
			fruits.update(
				{_id: tdocs[0]._id},
				{$set: {'colors.1': newColor}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[0]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.colors[1]).equal(newColor);
						done();
						tdocs[0].colors[1] = newColor;
					});
				}
			);
		});

		it('add array field using $set (expect error)', function(done) {
			fruits.update(
				{_id: tdocs[0]._id},
				{$set: {'colors.abc': 'def'}},
				function(err) {
					expect(err).ok();
					expect(err).an(Error);
					expect(err.message).equal(
						'can\'t append to array using string field name [abc]'
					);
					done();
				}
			);
		});

		it('add new field using $set', function(done) {
			var production = {
				'India': {ratio: 20},
				'Uganda': {ratio: 8},
				'China': {ratio: 7}
			};
			fruits.update(
				{_id: tdocs[2]._id},
				{$set: {'production': production}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.production).eql(production);
						done();
						tdocs[2].production = production;
					});
				}
			);
		});

		it('fields at subdocument using $set', function(done) {
			var newRatioI = 22,
				newRatioU = 10;
			fruits.update(
				{_id: tdocs[2]._id},
				{$set: {
					'production.India.ratio': newRatioI,
					'production.Uganda.ratio': newRatioU
				}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.production.India.ratio).equal(newRatioI);
						expect(doc.production.Uganda.ratio).equal(newRatioU);
						tdocs[2].production.India.ratio = newRatioI;
						tdocs[2].production.Uganda.ratio = newRatioU;
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

		it('remove field from subdocument using $unset', function(done) {
			fruits.update(
				{_id: tdocs[2]._id},
				{$unset: {'production.India.ratio': 1}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.production.India).not.have.key('ratio');
						delete tdocs[2].production.India.ratio;
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

		it('increments number field', function(done) {
			var amount = 2;
			fruits.update(
				{_id: tdocs[2]._id},
				{$inc: {price: amount}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.price).eql(tdocs[2].price + amount);
						tdocs[2].price = tdocs[2].price + amount;
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

		it('increments non-number field (expect error)', function(done) {
			fruits.update(
				{_id: tdocs[2]._id},
				{$inc: {colors: 2}},
				function(err) {
					expect(err).ok();
					expect(err.message).equal(
						'Cannot apply $inc modifier to non-number'
					);
					done();
				}
			);
		});

		it('increments on not-number amount (expect error)', function(done) {
			fruits.update(
				{_id: tdocs[2]._id},
				{$inc: {price: 'a'}},
				function(err) {
					expect(err).ok();
					expect(err.message).equal(
						'Modifier $inc allowed for numbers only'
					);
					done();
				}
			);
		});
		it('rename field using $rename', function(done) {
			var production = tdocs[2].production;
			fruits.update(
				{_id: tdocs[2]._id},
				{$rename: {'production': 'manufacture'}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc).not.have.key('production');
						expect(doc).have.key('manufacture');
						expect(doc.manufacture).eql(production);
						delete tdocs[2].production;
						tdocs[2].manufacture = production;
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

		it('push element to array', function(done) {
			var color = 'blue';
			fruits.update(
				{_id: tdocs[2]._id},
				{$push: {colors: color}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.colors[doc.colors.length-1]).equal(color);
						tdocs[2].colors.push(color);
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

		it('push element to non-array (expect error)', function(done) {
			fruits.update(
				{_id: tdocs[2]._id},
				{$push: {price: 222}},
				function(err) {
					expect(err).ok();
					expect(err.message).equal(
						'Cannot apply $push/$pushAll modifier to non-array'
					);
					done();
				}
			);
		});

		it('push elements to array', function(done) {
			var colors = ['blue', 'green'];
			fruits.update(
				{_id: tdocs[2]._id},
				{$pushAll: {colors: colors}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.colors.slice(tdocs[2].colors.length)).eql(colors);
						tdocs[2].colors = tdocs[2].colors.concat(colors);
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

		it('push single element via $pushAll (expect error)', function(done) {
			fruits.update(
				{_id: tdocs[2]._id},
				{$pushAll: {colors: 'blue'}},
				function(err) {
					expect(err).ok();
					expect(err.message).equal(
						'Modifier $pushAll/pullAll allowed for arrays only'
					);
					done();
				}
			);
		});

		it('pull element from array', function(done) {
			var color = 'blue';
			fruits.update(
				{_id: tdocs[2]._id},
				{$pull: {colors: color}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						do {
							var index = tdocs[2].colors.indexOf(color);
							if (index != -1) tdocs[2].colors.splice(index, 1);
						} while (index != -1);
						expect(doc.colors).eql(tdocs[2].colors);
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

		it('pull element from non-array (expect err)', function(done) {
			fruits.update(
				{_id: tdocs[2]._id},
				{$pull: {price: 222}},
				function(err) {
					expect(err).ok();
					expect(err.message).equal(
						'Cannot apply $pull/$pullAll modifier to non-array'
					);
					done();
				}
			);
		});

		it('pull elements from array', function(done) {
			var colors = ['green', 'maroon'];
			fruits.update(
				{_id: tdocs[2]._id},
				{$pullAll: {colors: colors}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						colors.forEach(function(color) {
							do {
								var index = tdocs[2].colors.indexOf(color);
								if (index != -1) tdocs[2].colors.splice(index, 1);
							} while (index != -1);
						});
						expect(doc.colors).eql(tdocs[2].colors);
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

		it('pull single elements via $pullAll (expect error)', function(done) {
			fruits.update(
				{_id: tdocs[2]._id},
				{$pullAll: {colors: 'maroon'}},
				function(err) {
					expect(err).ok();
					expect(err.message).equal(
						'Modifier $pushAll/pullAll allowed for arrays only'
					);
					done();
				}
			);
		});

		it('push element to set', function(done) {
			var color = 'khaki';
			fruits.update(
				{_id: tdocs[2]._id},
				{$addToSet: {colors: color}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.colors[doc.colors.length-1]).equal(color);
						tdocs[2].colors.push(color);
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

		it('push same element to set do nothing', function(done) {
			var color = 'khaki';
			fruits.update(
				{_id: tdocs[2]._id},
				{$addToSet: {colors: color}},
				function(err) {
					if (err) {done(err); return;}
					fruits.findOne({_id: tdocs[2]._id}, function(err, doc) {
						if (err) {done(err); return;}
						expect(doc).ok();
						expect(doc.colors).eql(tdocs[2].colors);
						expect(doc).eql(tdocs[2]);
						done();
					});
				}
			);
		});

	});

	describe('remove', function() {
		var namesToRemove = null,
			docsToRemove = null,
			collectionDocsAfterRemove = null;

		it('find names to remove', function(done) {
			fruits.find({}).skip(1).limit(2).toArray(function(err, docs) {
				if (err) {done(err); return;}
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
				if (err) {done(err); return;}
				expect(docs).eql(docsToRemove);
				done();
			});
		});

		it('remove documents', function(done) {
			fruits.remove({name: {$in: namesToRemove}}, done);
		});

		it('expect documents can`t be find after remove', function(done) {
			fruits.find({name: {$in: namesToRemove}}).toArray(function(err, docs) {
				if (err) {done(err); return;}
				expect(docs).length(0);
				done();
			});
		});

		it('expect collection only 2 documents', function(done) {
			fruits.find().toArray(function(err, docs) {
				if (err) {done(err); return;}
				expect(docs).equalSet(collectionDocsAfterRemove);
				done();
			});
		});

		// simple current storage engine test
		it('new connection should load only 2 document', function(done) {
			baseTest.connectToDb(function(err, client) {
				if (err) {done(err); return;}
				var fruits = client.db('pinkydbTest').collection('fruits');
				fruits.find().toArray(function(err, docs) {
					if (err) {done(err); return;}
					expect(docs).equalSet(collectionDocsAfterRemove);
					done();
				});
			});
		});
	});

	describe('find', function() {
		it('returns cloned document', function(done) {
			fruits.find({_id: tdocs[0]._id}).toArray(function(err, docs) {
				if (err) {done(err); return;}
				expect(docs).an(Array);
				expect(docs).length(1);
				var price = docs[0].price;
				docs[0].price = 55;
				fruits.find({_id: docs[0]._id}).toArray(function(err, docs) {
					if (err) {done(err); return;}
					expect(docs).an(Array);
					expect(docs).length(1);
					expect(docs[0].price).eql(price);
					done();
				});
			});
		});

		it('with emty results returns empty array', function(done) {
			fruits.find({price: 'free'}).toArray(function(err, docs) {
				if (err) {done(err); return;}
				expect(docs).an(Array);
				expect(docs).length(0);
				done();
			});
		});

	});

	describe('findOne', function() {
		it('emty results returns null', function(done) {
			fruits.findOne({price: 'free'}, function(err, doc) {
				if (err) {done(err); return;}
				expect(doc).eql(null);
				done();
			});
		});
	});
});


/**
 * Helpers used above
 */
function createHash(array, field) {
	var hash = {};
	array.forEach(function(item) {
		hash[item[field]] = item;
	});
	return hash;
}

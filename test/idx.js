'use strict';

var expect = require('expect.js'),
	baseTest = require('./baseTest'),
	Idx = require('../lib/idx').Idx;

describe('index', function() {
	var index = null, docs = [];
	it('will be created without errors', function(done) {
		index = new Idx();
		done();
	});

	it('accepts keys and values', function(done) {
		for (var i = 0; i < 10; i++) {
			var num = Math.random();
			docs.push({num: num});
			index.push(num, docs[docs.length - 1]);
		}
		done();
	});

	it('pushed values equals to external', function(done) {
		expect(index.values).equalSet(docs);
		done();
	});
});

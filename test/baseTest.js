'use strict';

var pinkydb = require('../lib');

exports.connectToDb = function(params, callback) {
	pinkydb.open(params, callback);
};

describe('bootstrap', function() {
	describe('connect', function() {
		it('to pinkydb', function(done) {
			exports.connectToDb({storage: {path: '/tmp'}}, function(err, client) {
				if (err) done(err);
				var db = client.db('food');
				exports.collections = {
					fruits: db.collection('fruits')
				};
				done();
			});
		});
	});
});


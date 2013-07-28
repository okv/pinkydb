var pinkydb = require('pinkydb');
var utils = pinkydb.utils;

baseTest = {};
baseTest.um = false;
baseTest.connectToDb = function(storage, callback) {
	var args = utils.toArray(arguments),
		storage = !utils.isFunction(args[0]) ? args[0] : {type: 'memory'},
		callback = (utils.isFunction(args[0]) ? args[0] : args[1]) || utils.noop;
	pinkydb.open({storage: storage}, function(err, client) {
		callback(err, client);
	});
};

describe('bootstrap', function() {
	describe('connect', function() {
		it('to pinkydb', function(done) {
			baseTest.connectToDb(function(err, client) {
				if (err) done(err);
				var db = client.db('pinkydbTest');
				baseTest.collections = {
					fruits: db.collection('fruits'),
					users: db.collection('users')
				};
				done();
			});
		});
	});
});

/**
 * It's monkey patch to refine and extend expect.js lib
 */

var expectProto = expect.Assertion.prototype;

/**
 * Compare arrays as sets (compare arrays regardless of order of their items)
 */
expectProto.equalSet = function(expected) {
	var actual = this.obj;
	if (!actual || !expected) {
		throw new Error('actual or expected not exists');
	}
	this.assert(
		(actual.length == expected.length) && actual.every(function(actual) {
			return expected.some(function(expected) {
				return utils.isEqual(actual, expected);
			});
		}),
		function() {
			return 'expected ' + JSON.stringify(actual) + ' is equal set to ' +
				JSON.stringify(expected);
		},
		function() {
			return 'expected ' + JSON.stringify(actual) + ' is not equal set to ' +
				JSON.stringify(expected);
		});
	return this;
};

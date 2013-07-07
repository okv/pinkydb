'use strict';

exports.createStorage = function(params) {
	try {
		var Storage = require('./' + params.type).Storage;
		return new Storage(params);
	} catch(err) {
		err.message =
			'Can`t load storage by type: `' + params.type + '`: ' + err.message;
		throw err;
	}
};

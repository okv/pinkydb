'use strict';

var utils = require('./utils');


function Hook() {
	this._hooks = {
		afterInsert: [],
		afterUpdate: [],
		afterRemove: []
	};
}

Hook.prototype._checkAction = function(action) {
	if (action in this._hooks === false) {
		throw new Error('Unknown action: `' + action + '`');
	}
};

Hook.prototype.on = function(action, hook) {
	this._checkAction(action);
	this._hooks[action].push(hook);
};

Hook.prototype.trigger = function(action, params, callback) {
	callback = callback || utils.noop;
	this._checkAction(action);
	var hooks = this._hooks[action];
	var funcs = hooks.map(function(hook, index) {
		return function() {
			//console.log('>> hook = ', hook)
			hook(params, function(err) {
				if (err) {callback(err); return;}
				//console.log('>> next hook = ', (index < funcs.length - 1))
				if (index < funcs.length - 1) funcs[++index]();
			});
		};
	});
	funcs.push(callback);
	// starts sequntial hooks execution
	if (funcs.length) funcs[0]();
};

exports.Hook = Hook;

require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({"./lib/index":[function(require,module,exports){
module.exports=require('jyZf1S');
},{}],"jyZf1S":[function(require,module,exports){
'use strict';

var Client = require('./client').Client;

exports.open = function(params, callback) {
	var client = new Client(params);
	client.open(params, callback);
};

exports.utils = require('./utils');

},{"./client":1,"./utils":2}],2:[function(require,module,exports){
(function(){'use strict';

// Add isType methods: isArguments, etc
// TODO: investigate `isFunction` returns false in browser (when try to insert)
// into collection nad passes callback, thats why currently it's omitted
['Arguments', 'String', 'Number', 'Date', 'RegExp'].forEach(
	function(name) {
		exports['is' + name] = function(obj) {
			return toString.call(obj) == '[object ' + name + ']';
		};
	}
);

exports.isFunction = function(obj) {
	return typeof obj == 'function';
};

 exports.isObject = function(obj) {
	return obj === Object(obj);
};

exports.isArray = Array.isArray;

// Safely create a real, live array from anything iterable.
exports.toArray = function(obj) {
	if (!obj) return [];
	if (exports.isArray(obj)) return Array.prototype.slice.call(obj);
	//if (obj.length === +obj.length) return _.map(obj, _.identity);
	return exports.values(obj);
};

exports.noop = function() {};

exports.values = function(obj) {
	var values = [];
	for (var key in obj) if (key in obj) values.push(obj[key]);
	return values;
};

exports.clone = function(obj) {
	return c(obj);
};

// https://gist.github.com/lxyd/2369704
function c(o,i,r){
    if(o && typeof o=="object") {
        r = o instanceof Array ? [] : {};
        for(i in o)
            o.hasOwnProperty(i)?
            r[i] = o[i]===o ? r : c(o[i])
            :0
    }
    return r||o
}

exports.has = function(obj, key) {
	return obj.hasOwnProperty(key);
};

// Internal recursive comparison function for `isEqual`.
var eq = function(a, b, aStack, bStack) {
	// Identical objects are equal. `0 === -0`, but they aren't identical.
	// See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
	if (a === b) return a !== 0 || 1 / a == 1 / b;
	// A strict comparison is necessary because `null == undefined`.
	if (a == null || b == null) return a === b;
	// Unwrap any wrapped objects.
	// if (a instanceof _) a = a._wrapped;
	// if (b instanceof _) b = b._wrapped;
	// Compare `[[Class]]` names.
	var className = toString.call(a);
	if (className != toString.call(b)) return false;
	switch (className) {
		// Strings, numbers, dates, and booleans are compared by value.
		case '[object String]':
			// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
			// equivalent to `new String("5")`.
			return a == String(b);
		case '[object Number]':
			// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
			// other numeric values.
			return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
		case '[object Date]':
		case '[object Boolean]':
			// Coerce dates and booleans to numeric primitive values. Dates are compared by their
			// millisecond representations. Note that invalid dates with millisecond representations
			// of `NaN` are not equivalent.
			return +a == +b;
		// RegExps are compared by their source patterns and flags.
		case '[object RegExp]':
				return a.source == b.source &&
						a.global == b.global &&
						a.multiline == b.multiline &&
						a.ignoreCase == b.ignoreCase;
		}
	if (typeof a != 'object' || typeof b != 'object') return false;
	// Assume equality for cyclic structures. The algorithm for detecting cyclic
	// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	var length = aStack.length;
	while (length--) {
		// Linear search. Performance is inversely proportional to the number of
		// unique nested structures.
		if (aStack[length] == a) return bStack[length] == b;
	}
	// Add the first object to the stack of traversed objects.
	aStack.push(a);
	bStack.push(b);
	var size = 0, result = true;
	// Recursively compare objects and arrays.
	if (className == '[object Array]') {
		// Compare array lengths to determine if a deep comparison is necessary.
		size = a.length;
		result = size == b.length;
		if (result) {
			// Deep compare the contents, ignoring non-numeric properties.
			while (size--) {
				if (!(result = eq(a[size], b[size], aStack, bStack))) break;
			}
		}
	} else {
		// Objects with different constructors are not equivalent, but `Object`s
		// from different frames are.
		var aCtor = a.constructor, bCtor = b.constructor;
		if (aCtor !== bCtor && !(exports.isFunction(aCtor) && (aCtor instanceof aCtor) &&
			exports.isFunction(bCtor) && (bCtor instanceof bCtor))) {
			return false;
		}
		// Deep compare objects.
		for (var key in a) {
			if (exports.has(a, key)) {
				// Count the expected number of properties.
				size++;
				// Deep compare each member.
				if (!(result = exports.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
			}
		}
		// Ensure that both objects contain the same number of properties.
		if (result) {
			for (key in b) {
				if (exports.has(b, key) && !(size--)) break;
			}
			result = !size;
		}
	}
	// Remove the first object from the stack of traversed objects.
	aStack.pop();
	bStack.pop();
	return result;
};

// Perform a deep comparison to check if two objects are equal.
exports.isEqual = function(a, b) {
	return eq(a, b, [], []);
};

exports.freeze = function(obj, deep) {
	Object.freeze(obj);
	if (deep) Object.getOwnPropertyNames(obj).forEach(function(prop) {
		if (
			obj.hasOwnProperty(prop) &&
			obj[prop] !== null &&
			(exports.isObject(obj[prop]) || exports.isFunction(obj[prop])) &&
			!Object.isFrozen(obj[prop])
		) exports.freeze(obj[prop]);
	});
}

})()
},{}],1:[function(require,module,exports){
'use strict';

var utils = require('./utils'),
	Db = require('./db').Db;

function Client() {
	this.dbs = {};
}

Client.prototype.open = function(params, callback) {
	callback = callback || utils.noop;
	this.params = params;
	callback(null, this);
};

Client.prototype.db = function(name) {
	if (name in this.dbs === false) {
		this.dbs[name] = new Db(name, this.params);
	}
	return this.dbs[name];
};

exports.Client = Client;

},{"./utils":2,"./db":3}],3:[function(require,module,exports){
'use strict';

var Collection = require('./collection').Collection,
	createStorage = require('./storage').createStorage;

function Db(name, params) {
	params = params || {};
	params.storage = params.storage || {};
	params.storage.type = params.storage.type || 'fs';
	this.name = name;
	this.collections = {};
	this.storage = createStorage(params.storage);
}

Db.prototype.collection = function(name) {
	var self = this;
	if (name in self.collections === false) {
		self.collections[name] = new Collection(name);
		self.storage.loadCollection(self, self.collections[name]);
		self.collections[name].on('afterInsert', function(params, done) {
			self.storage.saveCollection(self, self.collections[name], done);
		});
		self.collections[name].on('afterUpdate', function(params, done) {
			self.storage.saveCollection(self, self.collections[name], done);
		});
		self.collections[name].on('afterRemove', function(params, done) {
			self.storage.saveCollection(self, self.collections[name], done);
		});
	}
	return this.collections[name];
};

exports.Db = Db;

},{"./collection":4,"./storage":5}],5:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict';

var compileQuery = require('./query').compile,
	utils = require('./utils'),
	util = require('util'),
	Cursor = require('./cursor').Cursor,
	Hook = require('./hook').Hook;

/**
 * Collection
 *
 * Notice: utils.clone used for unlink documentss from database
 */

function Collection(name) {
	Hook.apply(this);
	this.name = name;
	this._idSeq = 0;
	this._indexes = {_id: {}};
}

util.inherits(Collection, Hook);

Collection.prototype.nextId = function() {
	this._idSeq++;
	return this._idSeq;
};

Collection.prototype.insert = function(docs) {
	var self = this,
		args = utils.toArray(arguments),
		options = utils.isObject(args[1]) ? args[1] : {},
		arg1or2 = args[1] || args[2],
		callback = utils.isFunction(arg1or2) ? arg1or2 : utils.noop;
	if (!utils.isArray(docs)) docs = [docs];
	var inputDocs = docs;
	docs = utils.clone(docs);
	var errorDuringInsert = false;
	docs.forEach(function(doc, index) {
		if ('_id' in doc == false) doc._id = self.nextId();
		if (doc._id in self._indexes._id) {
			callback(new Error('duplicate key error `_id`: ' + doc._id));
			errorDuringInsert = true;
			return;
		}
		self._indexes._id[doc._id] = doc;
		// set `_id` to input documents
		inputDocs[index]._id = doc._id;
	});
	if (!errorDuringInsert) this.trigger('afterInsert', {}, callback);
};

Collection.prototype.update = function(query, modifier) {
	var self = this,
		args = utils.toArray(arguments),
		options = !utils.isFunction(args[2]) ? args[2] : {},
		callback = (utils.isFunction(args[2]) ? args[2] : args[3]) || utils.noop;
	if (options.multi) {
		callback(new Error('multi update currently unsupported'));
		return;
	}
	this.find(query).toArray(function(err, docs) {
		if (err) {callback(err);return;}
		docs = options.multi ? docs : docs.slice(0, 1);
		var errorDuringUpdate = false;
		docs.forEach(function(doc) {
			if ('_id' in modifier && modifier._id != doc._id) {
				callback(new Error('cannot change _id of document'));
				errorDuringUpdate = true;
				return;
			}
			// TODO: add support different modifiers like $set
			modifier = utils.clone(modifier);
			modifier._id = doc._id;
			self._indexes._id[doc._id] = modifier;
		});
		if (!errorDuringUpdate) self.trigger('afterUpdate', {}, callback);
	});
};

Collection.prototype.find = function(query, callback) {
	var callback = callback || utils.noop,
		docs = null,
		err = null;
	try {
		docs = this._find(query);
	} catch(error) {
		err = error;
	}
	// console.time('>>> find clone time')
	docs = utils.clone(docs);
	// console.timeEnd('>>> find clone time')
	// console.log('>>> cloned count = ', docs ? docs.length : 0)
	var cursor = new Cursor(err, docs);
	callback(err, cursor);
	return cursor;
};

Collection.prototype._find = function(query) {
	var callback = callback || utils.noop,
		query = query || {},
		matcher = utils.isFunction(query) ? query : compileQuery(query),
		docs = [];
	// console.time('>>> search time')
	for (var _id in this._indexes._id) {
		var doc = this._indexes._id[_id];
		if (matcher.call(doc)) docs.push(doc);
	}
	// console.timeEnd('>>> search time')
	return docs;
};

Collection.prototype.findOne = function(query, callback) {
	var callback = callback || utils.noop;
	this.find(query).toArray(function(err, docs) {
		callback(err, docs && docs.length ? docs[0] : null);
	});
};

Collection.prototype.remove = function(query, callback) {
	var self = this,
		callback = callback || utils.noop;
	this.find(query).toArray(function(err, docs) {
		if (err) {callback(err);return;}
		docs.forEach(function(doc) {
			delete self._indexes._id[doc._id];
		});
		self.trigger('afterRemove', {}, callback);
	});
};

exports.Collection = Collection;

},{"util":6,"./query":7,"./hook":8,"./cursor":9,"./utils":2}],6:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":10}],11:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],10:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":11}],7:[function(require,module,exports){
'use strict';

var utils = require('./utils');

/**
 * Common notice:
 * av - actual value
 * ev - expected value
 * compile time - at this phase we translate query to js source code
 * run time - phase when we execute generated source code
 * all functions prefixed with `gen` (e.g. genQuery) executed at compile time
 */

/**
 * Generate js source code for query
 * @param {Object} query Complex query e.g. {a: 1, {$or: [{b: 'test', c: 2}]}}
 * @returns {String}
 */
function genQuery(query) {
	var keys = Object.keys(query);
	if (keys.length == 0) {
		return 'true';
	} else if (keys.length == 1) {
		var key = Object.keys(query)[0];
		return genExpr(key, query[key]);
	} else {
		return '(' + keys.map(function(key) {
			return genExpr(key, query[key]);
		}).join(' && ') + ')';
	}

	/**
	 * Generate js source code for expression
	 * @param {String} field e.g. `a`
	 * @param {Any} ev expected `field` value
	 * @returns {String}
	 */
	function genExpr(field, ev) {
		if (isOperator(field)) {
			return genCondition(field, ev);
		} else {
			if (utils.isObject(ev) && isConditionObject(ev) && !utils.isRegExp(ev)) {
				return genComparations(field, ev);
			} else {
				return genComparation('$eq', field, ev);
			}
		}

		function isOperator(key) {
			return /^\$/.test(key);
		}

		function isConditionObject(obj) {
			return Object.keys(obj).every(function(key) {
				return isOperator(key);
			});
		}

		function genComparation(operator, field, ev) {
			if (operator in comparisonOperators === false) {
				throw new Error('Unknown operator `' + operator + '`');
			}
			ev = utils.isRegExp(ev) ? ev : JSON.stringify(ev);
			return 'compare(this, "' + field + '", "' + operator + '", ' + ev + ')';
		}

		function genComparations(field, ev) {
			return '(' + Object.keys(ev).map(function(operator) {
				return genComparation(operator, field, ev[operator]);
			}).join(' && ') + ')';
		}
	}
}


/**
 * Generate js source code for query and conditional `operator` (see
 * description bellow)
 */
var genCondition = (function() {
	var conditionOperators = {};
	conditionOperators.$or = function(arr) {
		return arrCondition(arr, '||');
	};
	conditionOperators.$and = function(arr) {
		return arrCondition(arr, '&&');
	};

	function arrCondition(arr, sep) {
		return '(' + arr.map(function(val) {
			return genQuery(val);
		}).join(' ' + sep + ' ') + ')';
	}

	/**
	 * Generate js source code for `query` using `operator`
	 * @param {String} operator Logical operator e.g. `$or`
	 * @param {Array} query Some query e.g. [{a: 1}, {b: 2}]
	 */
	return function (operator, query) {
		return conditionOperators[operator](query);
	};
})();


/**
 * Comparison operators
 */
var comparisonOperators = {};
comparisonOperators.$eq = function(av, ev) {
	if (!utils.isRegExp(ev) && utils.isObject(ev) && utils.isObject(av)) {
		return utils.isEqual(av, ev);
	} else if (utils.isRegExp(ev)) {
		return comparisonOperators.$regex(av, ev);
	} else {
		return av == ev;
	}
};
comparisonOperators.$ne = function(av, ev) {
	return !comparisonOperators.$eq(av, ev);
};
comparisonOperators.$gt = function(av, ev) { return av > ev; };
comparisonOperators.$gte = function(av, ev) { return av >= ev; };
comparisonOperators.$lt = function(av, ev) { return av < ev; };
comparisonOperators.$lte = function(av, ev) { return av <= ev; };
comparisonOperators.$in = function(av, ev) {
	if (ev && utils.isArray(ev)) {
		if (av && utils.isArray(av)) {
			return ev.some(function(ev) {
				return ~av.indexOf(ev);
			});
		} else {
			return ev.some(function(ev) {
				return comparisonOperators.$eq(av, ev);
			});
		}
	} else {
		throw new Error('$in/$nin requires an array');
	}
};
comparisonOperators.$nin = function(av, ev) {
	return !comparisonOperators.$in(av, ev);
};
comparisonOperators.$regex = function(av, ev) {
	if (!utils.isRegExp(ev)) throw new Error(
		'$regex requires instance of RegExp'
	);
	return ev.test(av);
};


/**
 * Compare value of object key using `operator` with expected value
 * @returns {Boolean}
 */
function compare(obj, key, operator, ev) {
	var av = ek(obj, key);
	if (utils.isArray(av) && !utils.isArray(ev)) {
		return av[operator == '$ne' ? 'every' : 'some'](function(av) {
			return comparisonOperators[operator](av, ev);
		});
	} else {
		return comparisonOperators[operator](av, ev);
	}
}

// extract key value from object
function ek(obj, key) {
	return obj[key];
}

function compile(query) {
	return eval(
		'var func = function() {return ' + genQuery(query) + ';}; func;'
	);
}

exports.compile = compile;

},{"./utils":2}],8:[function(require,module,exports){
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

},{"./utils":2}],9:[function(require,module,exports){
'use strict';

var utils = require('./utils');

function Cursor(err, docs) {
	this._err = err;
	this._docs = docs;
}

Cursor.prototype.toArray = function(callback) {
	callback = callback || utils.noop;
	callback(this._err, this._docs);
};

Cursor.prototype.skip = function(n) {
	return new Cursor(this._err, this._docs.slice(n));
};

Cursor.prototype.limit = function(n) {
	return new Cursor(this._err, this._docs.slice(0, n));
};

Cursor.prototype.count = function(callback) {
	callback = callback || utils.noop;
	callback(this._err, this._docs.length);
};

exports.Cursor = Cursor;

},{"./utils":2}]},{},[])
;
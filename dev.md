# some notes, research, etc

## get key from object by path

> var oo = []; for (var i=0; i<10000; i++) { oo.push({a: {b: {c: i}, k: 'asdaaaaaaaaaaaaaaaaaaaaaaa'}}); };
10000
> console.time('bench'); var res;  for (var i=0, n=oo.length; i<n; i++ ) { res = (typeof oo[i] == 'object' || undefined) && oo[i]['a'] && oo[i]['a']['b'] && oo[i]['a']['b']['c'] }; console.timeEnd('bench'); console.log(res, n);
bench: 3ms
9999 10000

var docs = JSON.parse(require('fs').readFileSync('/tmp/pinkydb-benchmark-data'))
console.time('b'); docs.filter(function(doc) { return doc.birthday > 654724800000 && doc.birthday < 970340400000 }).length; console.timeEnd('b')

var utils = require('./lib/utils'); utils.get({a: [{v: 1, c: [{v: 3}]}, {v: 2, c: [{v: 4, d: [{a: 111}]}, {v: 5, d: [{a: 222}]}] }]}, 'a.c.d.a');

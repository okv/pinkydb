# some notes, research, etc

## get key from object by path

> var oo = []; for (var i=0; i<10000; i++) { oo.push({a: {b: {c: i}, k: 'asdaaaaaaaaaaaaaaaaaaaaaaa'}}); };
10000
> console.time('bench'); var res;  for (var i=0, n=oo.length; i<n; i++ ) { res = (typeof oo[i] == 'object' || undefined) && oo[i]['a'] && oo[i]['a']['b'] && oo[i]['a']['b']['c'] }; console.timeEnd('bench'); console.log(res, n);
bench: 3ms
9999 10000

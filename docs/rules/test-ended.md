# Ensure callback tests are explicitly ended

If you forget a `t.end();` in `test.cb()` the test will hang indefinitely.


## Fail

```js
const test = require('ava');

test.cb(t => {
	t.pass();
});
```


## Pass

```js
const test = require('ava');

test.cb(t => {
	t.pass();
	t.end();
});
```

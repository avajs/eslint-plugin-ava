# Ensure callback tests are explicitly ended

If you forget a `t.end();` in `test.cb()` the test will hang indefinitely.


## Fail

```js
import test from 'ava';

test.cb(t => {
	t.pass();
});
```


## Pass

```js
import test from 'ava';

test.cb(t => {
	t.pass();
	t.end();
});

test.cb(t => {
	acceptsCallback(t.end);
});
```

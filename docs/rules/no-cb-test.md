# Ensure no `test.cb()` is used

Disallow the use of `test.cb()`. We instead recommend using `test()` with an async function or a function returning a promise.


## Fail

```js
import test from 'ava';

test.cb('some test', t => {
	t.pass();
	t.end();
});
```


## Pass

```js
import test from 'ava';

test('some test', async t => {
	t.pass();
});
```

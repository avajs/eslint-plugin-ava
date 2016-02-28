# Ensure `t.end()` is only called inside `test.cb()`

AVA will fail if `t.end()` is called in a non-`cb` test function.


## Fail

```js
import test from 'ava';

test('some test', t => {
	t.pass();
	t.end();
});
```


## Pass

```js
import test from 'ava';

test('some test', t => {
	t.pass();
});

test.cb('some test', t => {
	t.pass();
	t.end();
});
```

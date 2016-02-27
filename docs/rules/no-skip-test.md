# Ensure no tests are skipped

It's easy to make a test skipped with test.skip() and then forget about it. It's visible in the results, but still easily missed.


## Fail

```js
import test from 'ava';

test('foo', t => {
	t.pass();
});

test.skip('bar', t => {
	t.pass();
});
```


## Pass

```js
import test from 'ava';

test('foo', t => {
	t.pass();
});

test('bar', t => {
	t.pass();
});
```

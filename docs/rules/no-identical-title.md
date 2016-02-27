# Ensure no tests have the same title

Disallow tests with identical titles as it makes it hard to differentiate them.


## Fail

```js
import test from 'ava';

test('foo', t => {
	t.pass();
});

test('foo', t => {
	t.pass();
});
```


## Pass

```js
import test from 'ava';

test(t => {
	t.pass();
});

test('foo', t => {
	t.pass();
});

test('bar', t => {
	t.pass();
});
```

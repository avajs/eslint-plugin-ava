# Ensure no assertions are called from inline functions

Prevent assertions being called from an inline function, to make it clear that it does not return.

## Fail
```js
import test from 'ava';

test('foo', t => t.true(fn()));
```

## Pass
```js
import test from 'ava';

test('foo', t => {
	t.true(fn())
});
```

# Ensure assertions are not called from inline arrow functions

An inline arrow function is an arrow function with concise body, i.e. `x => x` will return `x` to the caller. The test implementation, composed of a series of assertions, should not be an inline arrow function as assertions do not return.
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

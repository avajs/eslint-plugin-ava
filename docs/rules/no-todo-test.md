# Ensure no `test.todo()` is used

Disallow the use of `test.todo()`. You might want to do this to only ship features with specs fully written and passing.


## Fail

```js
import test from 'ava';

test.todo('some test');
```


## Pass

```js
import test from 'ava';

test('some test', t => {
	// Some implementation
});
```

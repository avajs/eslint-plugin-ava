# Ensure that `t.throwsAsync()` and `t.notThrowsAsync()` are awaited

When you use the `t.throwsAsync()` and `t.notThrowsAsync()` assertions, you must await the promise they return. If the test function completes before the assertions do, the test will fail.

This rule is fixable inside `async` functions. It will insert `await` before `t.throwsAsync()` and `t.notThrowsAsync()`.

## Fail

```js
import test from 'ava';

test('main', t => {
	t.throwsAsync(somePromise);
	t.notThrowsAsync(somePromise);
});
```

## Pass

```js
import test from 'ava';

test('main', t => {
	await t.throwsAsync(somePromise);
	await t.notThrowsAsync(somePromise);
	const p = t.throwsAsync(somePromise);
	t.throwsAsync(somePromise).then(…);
});
```

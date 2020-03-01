# Ensure that `t.throwsAsync()` and `t.notThrowsAsync()` are awaited

When you use the `t.throwsAsync()` and `t.notThrowsAsync()` assertions, you must await the promise they return. If the test function completes before the assertions do the test will fail. Ensure that `t.throwsAsync()` and `t.notThrowsAsync()` aren't called without await(or some other action using returned promise).

This rule is fixable inside `async` functions. It will insert `await` before `t.throwsAsync()` or `t.notThrowsAsync()` in question.
## Fail

```js
import test from 'ava';

test('main', t => {
	t.throwsAsync(async () => {});
	t.notThrowsAsync(async () => {});
});
```


## Pass

```js
import test from 'ava';

test('main', t => {
	await t.throwsAsync(async () => {});
	await t.notThrowsAsync(async () => {});
	let p = t.throwsAsync(async () => {});
	t.throwsAsync(async () => {}).then(...);
});
```

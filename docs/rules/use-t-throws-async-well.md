# Ensure that `t.throwsAsync()` and `t.notThrowsAsync()` aren't called without await

When you use the `t.throwsAsync()` and `t.notThrowsAsync()` assertions, you must await the promise they return. If the test function completes before the assertions do the test will fail. Ensure that `t.throwsAsync()` and `t.notThrowsAsync()` aren't called without await(or some other action using returned promise).

## Fail

```js
import test from 'ava';

test('main', t => {
	t.throwsAsync(() => {});
	t.notThrowsAsync(() => {});
});
```


## Pass

```js
import test from 'ava';

test('main', t => {
	await t.throwsAsync(() => {});
	await t.notThrowsAsync(() => {});
	let p = t.throwsAsync(() => {});
	t.throwsAsync(() => {}).then(...);
});
```

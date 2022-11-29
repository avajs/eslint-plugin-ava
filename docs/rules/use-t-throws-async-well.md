# Ensure that `t.throwsAsync()` and `t.notThrowsAsync()` are awaited (`ava/use-t-throws-async-well`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

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

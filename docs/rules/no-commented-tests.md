# ava/no-commented-tests

📝 Disallow commented-out tests.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Commented-out tests are invisible to the test runner and easy to forget about. Use `test.skip()` instead, which is visible in the test results.

## Fail

```js
import test from 'ava';

// test('foo', t => {
// 	t.pass();
// });

test('bar', t => {
	t.pass();
});
```

## Pass

```js
import test from 'ava';

test.skip('foo', t => {
	t.pass();
});

test('bar', t => {
	t.pass();
});
```

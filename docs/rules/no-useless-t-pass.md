# ava/no-useless-t-pass

📝 Disallow useless `t.pass()`.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

`t.pass()` only increments the assertion counter. Without `t.plan()`, this counter is never checked, making `t.pass()` a no-op that gives a false sense of testing.

If the intent is to verify code doesn't throw, use `t.notThrows()` or `t.notThrowsAsync()` instead.

## Examples

```js
import test from 'ava';

// ❌
test('main', t => {
	t.pass();
});

// ✅
test('main', t => {
	t.plan(1);
	t.pass();
});

// ✅
test('main', t => {
	t.notThrows(() => foo());
});
```

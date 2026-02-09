# ava/require-assertion

📝 Require that tests contain at least one assertion.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Require that tests contain at least one assertion.

A test without assertions always passes, which usually indicates a mistake such as a forgotten assertion or an incomplete test.

Any of AVA's assertion methods count: `t.is()`, `t.true()`, `t.pass()`, `t.plan()`, `t.snapshot()`, `t.throws()`, `t.try()`, etc. Passing `t` to a helper function also counts, as assertions may happen there.

Hooks (`test.before`, `test.beforeEach`, `test.after`, `test.afterEach`) and `test.todo()` are not required to contain assertions.

## Examples

```js
import test from 'ava';

// ❌
test('main', t => {
	doSomething();
});

// ❌
test('main', t => {
	t.log('debug');
});

// ✅
test('main', t => {
	const result = doSomething();
	t.is(result, expected);
});

// ✅
test('main', t => {
	t.pass();
});
```

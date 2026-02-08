# ava/prefer-t-throws

📝 Prefer `t.throws()` or `t.throwsAsync()` over try/catch.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Using try/catch with `t.fail()` to test that a function throws is verbose and error-prone. AVA provides `t.throws()` and `t.throwsAsync()` which are more concise and produce better failure output.

This rule flags try/catch blocks inside test functions where the try block contains a direct `t.fail()` call, since this is a strong signal the pattern should be replaced with `t.throws()` or `t.throwsAsync()`.

## Examples

```js
import test from 'ava';

// ❌
test('main', t => {
	try {
		foo();
		t.fail();
	} catch (error) {
		t.true(error.message === 'expected');
	}
});

// ✅
test('main', t => {
	const error = t.throws(() => foo());
	t.true(error.message === 'expected');
});

// ❌
test('main', async t => {
	try {
		await fetchData();
		t.fail();
	} catch (error) {
		t.is(error.statusCode, 500);
	}
});

// ✅
test('main', async t => {
	const error = await t.throwsAsync(fetchData());
	t.is(error.statusCode, 500);
});
```

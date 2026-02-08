# ava/no-nested-assertions

📝 Disallow nested assertions.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Disallow nesting assertions, such as using an assertion as an argument to another assertion or putting assertions inside a `t.throws()` callback.

Nested assertions are confusing and error-prone. For example, assertions inside `t.throws()` will have their failures caught by `throws`, and assertions used as arguments make the code harder to read.

## Examples

```js
import test from 'ava';

// ❌
test('main', t => {
	t.is(t.throws(() => foo()).message, 'expected');
});

// ✅
test('main', t => {
	const error = t.throws(() => foo());
	t.is(error.message, 'expected');
});

// ❌
test('main', t => {
	t.throws(() => {
		t.is(1, 2);
	});
});

// ✅
test('main', t => {
	t.throws(() => foo(), {message: 'expected'});
});
```

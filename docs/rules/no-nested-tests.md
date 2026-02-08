# ava/no-nested-tests

📝 Disallow nested tests.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-nested-tests.md)

In AVA, you cannot nest tests, for example, create tests inside of other tests. Doing so will lead to odd behavior.

## Examples

```js
import test from 'ava';

// ❌
test('foo', t => {
	const result = foo();
	t.true(result.foo);

	test('bar', t => {
		t.true(result.bar);
	});
});

// ✅
test('foo', t => {
	const result = foo();
	t.true(result.foo);
});

test('bar', t => {
	const result = foo();
	t.true(result.bar);
});
```

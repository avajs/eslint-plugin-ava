# ava/no-skip-test

📝 Disallow skipping tests.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-skip-test.md)

It's easy to make a test skipped with `test.skip()` and then forget about it. It's visible in the results, but still easily missed.

## Examples

```js
import test from 'ava';

test('foo', t => {
	t.pass();
});

test.skip('bar', t => { // ❌
	t.pass();
});

test('bar', t => { // ✅
	t.pass();
});

test.skipIf(true)('baz', t => { // ❌ Always skipped
	t.pass();
});

test.skipIf(process.platform === 'win32')('baz', t => { // ✅
	t.pass();
});
```

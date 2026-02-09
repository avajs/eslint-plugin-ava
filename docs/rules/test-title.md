# ava/test-title

📝 Require tests to have a title.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/test-title.md)

Tests should have a title. AVA [v1.0.1](https://github.com/avajs/ava/releases/tag/v1.0.1) and later enforces this at runtime.

The title must be a non-empty string without leading or trailing whitespace.

## Examples

```js
import test from 'ava';

test(t => { // ❌ Missing title
	t.pass();
});

test(123, t => { // ❌ Non-string title
	t.pass();
});

test('', t => { // ❌ Empty title
	t.pass();
});

test(' foo ', t => { // ❌ Leading/trailing whitespace (auto-fixable)
	t.pass();
});

test('foo', t => { // ✅
	t.pass();
});
```

# ava/no-skip-assert

📝 Disallow skipping assertions.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-skip-assert.md)

It's easy to make an assertion skipped with `t.skip.xyz()` and then forget about it.

## Fail

```js
import test from 'ava';

test('some title', t => {
	t.skip.is(1, 1);
});
```

## Pass

```js
import test from 'ava';

test('some title', t => {
	t.is(1, 1);
});
```

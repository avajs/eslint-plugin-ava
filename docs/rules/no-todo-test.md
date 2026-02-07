# ava/no-todo-test

📝 Disallow `test.todo()`.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-todo-test.md)

Disallow the use of `test.todo()`. You might want to do this to only ship features with specs fully written and passing.

## Fail

```js
import test from 'ava';

test.todo('some test');
```

## Pass

```js
import test from 'ava';

test('some test', t => {
	// Some implementation
});
```

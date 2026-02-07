# ava/no-unknown-modifiers

📝 Disallow unknown test modifiers.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-unknown-modifiers.md)

Prevent the use of unknown [test modifiers](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md).

## Fail

```js
import test from 'ava';

test.onlu(t => {});
test.seril(t => {});
test.beforeeach(t => {});
test.unknown(t => {});
```

## Pass

```js
import test from 'ava';

test.only(t => {});
test.serial(t => {});
test.beforeEach(t => {});
```

# Ensure assertions are not called from inline arrow functions (`ava/no-inline-assertions`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-inline-assertions.md)

The test implementation should not purely consist of an inline assertion as assertions do not return a value and having them inline also makes the tests less readable.

This rule is fixable. It will wrap the assertion in braces `{}`. It will not do any whitespace or style changes.

## Fail

```js
const test = require('ava');

test('foo', t => t.true(fn()));
```

## Pass

```js
const test = require('ava');

test('foo', t => {
	t.true(fn());
});
```

# Ensure tests have a title (`ava/test-title`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/test-title.md)

Tests should have a title. AVA [v1.0.1](https://github.com/avajs/ava/releases/tag/v1.0.1) and later enforces this at runtime.

## Fail

```js
const test = require('ava');

test(t => {
	t.pass();
});
```

## Pass

```js
const test = require('ava');

test('foo', t => {
	t.pass();
});
```

# Ensure no tests have the same title (`ava/no-identical-title`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-identical-title.md)

Disallow tests with identical titles as it makes it hard to differentiate them.

## Fail

```js
const test = require('ava');

test('foo', t => {
	t.pass();
});

test('foo', t => {
	t.pass();
});
```

## Pass

```js
const test = require('ava');

test('foo', t => {
	t.pass();
});

test('bar', t => {
	t.pass();
});
```

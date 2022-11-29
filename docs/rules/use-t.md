# Ensure test functions use `t` as their parameter (`ava/use-t`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/use-t.md)

The convention is to have the parameter in AVA's test function be named `t`. Most rules in `eslint-plugin-ava` are based on that assumption.

### Fail

```js
const test = require('ava');

test('foo', foo => { // Incorrect name
	t.pass();
});
```

### Pass

```js
const test = require('ava');

test('foo', () => {
	// ...
});

test('bar', t => {
	t.pass();
});
```

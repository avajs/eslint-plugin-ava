# Ensure no tests are skipped

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-skip-test.md)

It's easy to make a test skipped with `test.skip()` and then forget about it. It's visible in the results, but still easily missed.

This rule is fixable. It will remove the `.skip` test modifier.


## Fail

```js
const test = require('ava');

test('foo', t => {
	t.pass();
});

test.skip('bar', t => {
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

## Options

The rule takes the following options:

* `fix`: whether to fix violations (default true)

You can set the option in configuration like this:

```js
"ava/no-skip-test": ["error", { fix: false }]
```

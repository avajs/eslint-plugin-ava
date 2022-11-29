# Ensure test titles have a certain format (`ava/test-title-format`)

🚫 This rule is _disabled_ in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/test-title-format.md)

This rule is useful when you want to make sure all test titles match a common pattern to increase readability when tests fail.

For example, titles like `'Should throw when invalid.'`, `'Should fail when called.'` or `'Should pass when using any number.'` could be enforced with the following pattern `'^Should (pass|fail|throw) when [\\w ]+\\.$'` (Note the escaped `\`).

## Fail

```js
/* eslint ava/test-title-format: ["error", {format: "^Should"}] */
const test = require('ava');

test('Not starting with `Should`', t => {
	t.pass();
});
```

```js
/* eslint ava/test-title-format: ["error", {format: "\\.$"}] */
const test = require('ava');

test('Doesn\'t end with a dot', t => {
	t.pass();
});
```

## Pass

```js
/* eslint ava/test-title-format: ["error", {format: "^Should"}] */
const test = require('ava');

test('Should pass tests', t => {
	t.pass();
});

test('Should behave as expected', t => {
	t.pass();
});
```

```js
/* eslint ava/test-title-format: ["error", {format: "\\.$"}] */
const test = require('ava');

test('End with a dot.', t => {
	t.pass();
});
```

## Options

This rule supports the following options:

`format`: A regular expression string to match against the test titles.

You can set the options like this:

```json
"ava/test-title-format": [
	"error",
	{
		"format": "^Should"
	}
]
```

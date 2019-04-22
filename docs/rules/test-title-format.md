# Ensure tests have a correct title format

Translations: 

Tests should have a title matching the format option.


## Fail

```js
/*eslint ava/test-title: ["error", {regexp: "^Should"}]*/
import test from 'ava';

test("Not starting with 'Should'", t => {
	t.pass();
});

/*eslint ava/test-title: ["error", {regexp: "\\.$"}]*/
import test from 'ava';

test('Doesn\'t end with a dot', t => {
	t.pass();
});
```


## Pass

```js
/*eslint ava/test-title: ["error", {regexp: "^Should"}]*/
import test from 'ava';

test('Should pass tests', t => {
	t.pass();
});

test('Should behave as expected', t => {
	t.pass();
});

/*eslint ava/test-title: ["error", {regexp: "\\.$"}]*/
import test from 'ava';

test('End with a dot.', t => {
	t.pass();
});
```

## Options

This rule supports the following options:

`regexp`: A regular expression string to match against the test titles. Overrides the default and the configuration found in the `package.json` or `ava.config.js` files.

You can set the options like this:

```js
"ava/test-title-format": ["error", {"regexp": "^Should"}]
```

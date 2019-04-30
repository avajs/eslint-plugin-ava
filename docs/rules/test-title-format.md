# Ensure tests have a correct title format

Tests should have a title matching the format option.


## Fail

```js
/* eslint ava/test-title: ["error", {format: "^Should"}] */
import test from 'ava';

test('Not starting with `Should`', t => {
	t.pass();
});
```

```js
/* eslint ava/test-title: ["error", {format: "\\.$"}] */
import test from 'ava';

test('Doesn\'t end with a dot', t => {
	t.pass();
});
```


## Pass

```js
/* eslint ava/test-title: ["error", {format: "^Should"}] */
import test from 'ava';

test('Should pass tests', t => {
	t.pass();
});

test('Should behave as expected', t => {
	t.pass();
});
```

```js
/* eslint ava/test-title: ["error", {format: "\\.$"}] */
import test from 'ava';

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

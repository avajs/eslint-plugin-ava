# Enforce test titles have a certain format

This rule is useful when you want to make sure all test title match a common pattern to increase readability when test fails.

For example, titles like `"Should throw when invalid."`, `"Should fail when called."` or `"Should pass when using any number."` could be standardise by `"^Should (pass|fail|throw) when [\\w ]+\\.$"` (note the escaped `\`).


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

# Ensure tests have a title

Tests should have a title.


## Fail

```js
const test = require('ava');

test(t => {
	t.pass();
	t.end();
});
```


## Pass

```js
const test = require('ava');

test('my test name', t => {
	t.pass();
	t.end();
});
```

## Options

The rule takes one option, a string, which could be either `"always"` or `"if-multiple"`. The default is `"always"`. If the option is set to `"if-multiple"`, the rule will only trigger if there are multiple tests in a file.

You can set the option in configuration like this:

```js
"test-title": [2, "always"]
```

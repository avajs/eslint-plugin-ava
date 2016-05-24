# Enforce passing correct arguments to assertions

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/assertion-arguments.md)

Enforces passing the right number of arguments to assertion methods like `t.is()`. This rule can optionally also enforce or forbid the use of assertion messages.

Assertion messages are optional arguments that can be given to any assertion call to improve the error message, should the assertion fail.
qq

## Fail

```js
import test from 'ava';

test(t => {
	t.is(value); // Not enough arguments
	t.is(value, expected, message, extra); // Too many arguments
});

/* eslint ava/assertion-arguments: ["error", {"message": "always"}] */
test(t => {
	t.true(array.indexOf(value) !== -1);
});

/* eslint ava/assertion-arguments: ["error", {"message": "never"}] */
test(t => {
	t.true(array.indexOf(value) !== -1, 'value is not in array');
});
```


## Pass

```js
import test from 'ava';

test(t => {
	t.is(value, expected);
	t.is(value, expected, message);
});

/* eslint ava/assertion-arguments: ["error", {"message": "always"}] */
test(t => {
	t.true(array.indexOf(value) !== -1, 'value is not in array');
});

/* eslint ava/assertion-arguments: ["error", {"message": "never"}] */
test(t => {
	t.true(array.indexOf(value) !== -1);
});
```


## Options

This rule supports the following options:

`message`: A string which could be either `"always"` or `"never"`. If set to `"always"`, all assertions will need to have an assertion message. If set to `"never"`, no assertion may have an assertion message. If omitted, no reports about the assertion message will be made.

You can set the option in configuration like this:

```js
"ava/assertion-arguments": ["error", {"message": "always"}]
```

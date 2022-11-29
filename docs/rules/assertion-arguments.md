# Enforce passing correct arguments to assertions (`ava/assertion-arguments`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/assertion-arguments.md)

Enforces passing the right number of arguments to assertion methods like `t.is()`. This rule can optionally also enforce or forbid the use of assertion messages.

Assertion messages are optional arguments that can be given to any assertion call to improve the error message, should the assertion fail.

This rule also attempts to enforce passing actual values before expected values. If exactly one of the first two arguments to a two-argument assertion is a static expression such as `{a: 1}`, then the static expression must come second. (`t.regex()` and `t.notRegex()` are excluded from this check, because either their `contents` argument or their `regex` argument could plausibly be the actual or expected value.) If the argument to a one-argument assertion is a binary relation such as `'static' === dynamic`, a similar check is performed on its left- and right-hand sides. Errors of these kinds are usually fixable.

## Fail

```js
const test = require('ava');

test('1', t => {
	t.is(value); // Not enough arguments
	t.is(value, expected, message, extra); // Too many arguments
	t.is(value, expected, false); // Assertion message is not a string
});

/* eslint ava/assertion-arguments: ["error", {"message": "always"}] */
test('2', t => {
	t.true(array.includes(value));
});

/* eslint ava/assertion-arguments: ["error", {"message": "never"}] */
test('3', t => {
	t.true(array.includes(value), 'value is not in array');
});
```

## Pass

```js
const test = require('ava');

test('1', t => {
	t.is(value, expected);
	t.is(value, expected, message);
});

/* eslint ava/assertion-arguments: ["error", {"message": "always"}] */
test('2', t => {
	t.true(array.includes(value), 'value is not in array');
});

/* eslint ava/assertion-arguments: ["error", {"message": "never"}] */
test('3', t => {
	t.true(array.includes(value));
});
```

## Options

This rule supports the following options:

`message`: A string which could be either `"always"` or `"never"`. If set to `"always"`, all assertions will need to have an assertion message. If set to `"never"`, no assertion may have an assertion message. If omitted, no reports about the assertion message will be made.

You can set the option in configuration like this:

```js
"ava/assertion-arguments": ["error", {"message": "always"}]
```

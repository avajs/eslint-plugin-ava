# Ensure `test.todo()` is not given an implementation function (`ava/no-todo-implementation`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-todo-implementation.md)

[`test.todo()`](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md#test-placeholders-todo) is intended for planning tests. It's not meant to be passed a function to implement the test, and if given one, AVA will throw an error. If you added an implementation, you probably meant to remove the `.todo` modifier.

## Fail

```js
const test = require('ava');

test.todo('title', t => {
	// ...
});
```

## Pass

```js
const test = require('ava');

test.todo('title');

test('title2', t => {
	// ...
});
```

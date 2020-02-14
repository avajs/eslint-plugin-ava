# Ensure assertions are not called from inline arrow functions

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-inline-assertions.md)

The test implementation should not purely consist of an inline assertion as assertions do not return a value and having them inline also makes the tests less readable.

This rule is fixable. It will wrap the assertion in braces `{}`. It will not do any whitespace or style changes.


## Fail

```js
const test = require('ava');

test('foo', t => t.true(fn()));
```


## Pass

```js
const test = require('ava');

test('foo', t => {
	t.true(fn());
});
```

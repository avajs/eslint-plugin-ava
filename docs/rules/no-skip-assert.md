# Ensure no assertions are skipped

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-skip-assert.md)

It's easy to make an assertion skipped with `t.skip.xyz()` and then forget about it.


## Fail

```js
const test = require('ava');

test('some title', t => {
	t.skip.is(1, 1);
});
```


## Pass

```js
const test = require('ava');

test('some title', t => {
	t.is(1, 1);
});
```

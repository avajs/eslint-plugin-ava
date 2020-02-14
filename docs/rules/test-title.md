# Ensure tests have a title

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/test-title.md)

Tests should have a title. AVA [v1.0.1](https://github.com/avajs/ava/releases/tag/v1.0.1) and later enforces this at runtime.


## Fail

```js
const test = require('ava');

test(t => {
	t.pass();
});
```


## Pass

```js
const test = require('ava');

test('foo', t => {
	t.pass();
});
```

# Ensure no tests have the same title

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-identical-title.md)

Disallow tests with identical titles as it makes it hard to differentiate them.


## Fail

```js
const test = require('ava');

test('foo', t => {
	t.pass();
});

test('foo', t => {
	t.pass();
});
```


## Pass

```js
const test = require('ava');

test(t => {
	t.pass();
});

test('foo', t => {
	t.pass();
});

test('bar', t => {
	t.pass();
});
```

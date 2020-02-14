# Ensure `t.end()` is only called inside `test.cb()`

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-invalid-end.md)

AVA will fail if `t.end()` is called in a non-`.cb` test function.


## Fail

```js
const test = require('ava');

test('some test', t => {
	t.pass();
	t.end();
});
```


## Pass

```js
const test = require('ava');

test('some test', t => {
	t.pass();
});

test.cb('some test', t => {
	t.pass();
	t.end();
});
```

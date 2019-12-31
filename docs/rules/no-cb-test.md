# Ensure no `test.cb()` is used

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-cb-test.md)

Disallow the use of `test.cb()`. We instead recommend using `test()` with an async function or a function returning a promise.


## Fail

```js
const test = require('ava');

test.cb('some test', t => {
	t.pass();
	t.end();
});
```


## Pass

```js
const test = require('ava');

test('some test', async t => {
	t.pass();
});
```

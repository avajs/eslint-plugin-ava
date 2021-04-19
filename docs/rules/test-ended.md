# Ensure callback tests are explicitly ended

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/test-ended.md)

If you forget a `t.end();` in `test.cb()` the test will hang indefinitely.

## Fail

```js
const test = require('ava');

test.cb(t => {
	t.pass();
});
```

## Pass

```js
const test = require('ava');

test.cb(t => {
	t.pass();
	t.end();
});

test.cb(t => {
	acceptsCallback(t.end);
});
```

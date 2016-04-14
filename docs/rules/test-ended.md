# Ensure callback tests are explicitly ended

Translations: [Français](https://github.com/sindresorhus/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/test-ended.md)

If you forget a `t.end();` in `test.cb()` the test will hang indefinitely.


## Fail

```js
import test from 'ava';

test.cb(t => {
	t.pass();
});
```


## Pass

```js
import test from 'ava';

test.cb(t => {
	t.pass();
	t.end();
});

test.cb(t => {
	acceptsCallback(t.end);
});
```

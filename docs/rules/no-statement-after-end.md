# Ensure `t.end()` is the last statement executed.

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-statement-after-end.md)

`t.end()` should mark the end of your test, and additional statements should not be executed.

## Fail

```js
const test = require('ava');

test.cb(t => {
	t.end();
	t.is(1, 1);
});

test.cb(t => {
	t.end();
	console.log('at the end');
});
```


## Pass

```js
const test = require('ava');

test.cb(t => {
	t.is(1, 1);
	t.end();
});
const test = require('ava');

test.cb(t => {
	if (a) {
		// Allowed because no further statements are reachable.
		return t.end();
	}
	if (b) {
		t.end();
		return;
	}
	t.is(1, 1);
	t.end();
});

```

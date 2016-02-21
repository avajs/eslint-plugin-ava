# Ensure no `test.cb()` is used

Disallow the use of `test.cb()`.


## Fail

```js
const test = require('ava');

test.cb('some test', (t) => {
	t.pass();
	t.end();
});
```


## Pass

```js
const test = require('ava');

test('some test', (t) => {
	t.pass();
});
```

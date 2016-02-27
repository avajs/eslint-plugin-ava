# Ensure no tests are skipped

It's easy to make a test skipped with test.skip() and then forget about it. It's visible in the results, but still easily missed.


## Fail

```js
const test = require('ava');

test.skip('some title', t => {
	t.pass();
	t.end();
});
```


## Pass

```js
const test = require('ava');

test('some title', t => {
	t.pass();
	t.end();
});
```

# Ensure no test.only() are present

It's easy to run only one test with test.only() and then forget about it. It's visible in the results, but still easily missed.


## Fail

```js
const test = require('ava');

test.only('some title', (t) => {
	t.pass();
	t.end();
});
```


## Pass

```js
const test = require('ava');

test('some title', (t) => {
	t.pass();
	t.end();
});
```

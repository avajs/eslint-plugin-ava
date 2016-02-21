# Ensure no tests have the same title

Disallow tests with identical titles as it makes it hard to differentiate them.


## Fail

```js
const test = require('ava');

test('some test', (t) => {
	t.pass();
});

test('some test', (t) => {
	t.pass();
});
```


## Pass

```js
const test = require('ava');

test((t) => {
	t.pass();
});

test('some test', (t) => {
	t.pass();
});

test('some other test', (t) => {
	t.pass();
});
```

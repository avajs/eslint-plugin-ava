# Limit the number of assertions in a test

Limit the amount of assertions in a test to enforce splitting up large tests into smaller ones.

Skipped assertions are counted.


## Fail

```js
/*eslint max-asserts: [2, 5]*/
const test = require('ava');

test('tests with too may asserts', (t) => {
	const array = getArrayUpTo(6);

	t.is(array.length, 6);
	t.is(array[0], 1);
	t.is(array[1], 2);
	t.is(array[2], 3);
	t.is(array[3], 4);
	t.is(array[4], 5);
	t.is(array[5], 6);
});
```


## Pass

```js
const test = require('ava');

test('my test name', (t) => {

test('tests with too may asserts', (t) => {
	const array = getArrayUpTo(6);

	t.same(array, [1, 2, 3, 4, 5, 6]);
});
```

## Options

The rule takes one option, a number, which is the maximum number of assertions for each test. The default is 5.

You can set the option in configuration like this:

"max-asserts": [2, 5]

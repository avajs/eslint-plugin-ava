# Prefer using `t.throws()` or `t.throwsAsync()` over try/catch

This rule will enforce the use of `t.throws()` or `t.throwsAsync()` when possible.

## Fail

```js
const test = require('ava');

test('some test', async t => {
	try {
		await throwingFunction();
		t.fail();
	} catch (error) {
		t.is(error.message, 'Unicorn overload');
	}
});
```

```js
const test = require('ava');

test('some test', async t => {
	try {
		await potentiallyThrowingFunction();
		await anotherPromise;
		await timeout(100, 'Unicorn timeout');
		t.fail();
	} catch (error) {
		t.ok(error.message.startsWith('Unicorn'));
	}
});
```

```js
const test = require('ava');

test('some test', async t => {
	try {
		synchronousThrowingFunction();
		t.fail();
	} catch (error) {
		t.is(error.message, 'Missing Unicorn argument');
	}
});
```

## Pass

```js
const test = require('ava');

test('some test', async t => {
	await t.throwsAsync(asyncThrowingFunction(), {message: 'Unicorn overload'});
});
```

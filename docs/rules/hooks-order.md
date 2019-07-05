# Enforce test hook ordering

Hooks should be placed before any tests and in the proper semantic order:

- `test.before(…);`
- `test.after(…);`
- `test.after.always(…);`
- `test.beforeEach(…);`
- `test.afterEach(…);`
- `test.afterEach.always(…);`
- `test(…);`

This rule is fixable as long as no other code is between the hooks that need to be reordered.


## Fail

```js
import test from 'ava';

test.after(t => {
	doFoo();
});

test.before(t => {
	doFoo();
});

test('foo', t => {
	t.true(true);
});
```

```js
import test from 'ava';

test('foo', t => {
	t.true(true);
});

test.before(t => {
	doFoo();
});
```


## Pass

```js
import test from 'ava';

test.before(t => {
	doFoo();
});

test.after(t => {
	doFoo();
});

test.after.always(t => {
	doFoo();
});

test.beforeEach(t => {
	doFoo();
});

test.afterEach(t => {
	doFoo();
});

test.afterEach.always(t => {
	doFoo();
});

test('foo', t => {
	t.true(true);
});
```

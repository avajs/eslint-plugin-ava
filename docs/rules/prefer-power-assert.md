# Only allow use of the assertions that have no power-assert alternative

- `t.ok()` __(You can do most things with this one)__
- `t.same()`
- `t.notSame()`
- `t.throws()`
- `t.notThrows()`
- `t.pass()`
- `t.fail()`

Useful for people wanting to fully embrace the power of power-assert.


## Fail

```js
import test from 'ava';

test(t => {
	t.is(foo, bar);
});
```


## Pass

```js
import test from 'ava';

test(t => {
	t.ok(foo === bar);
});
```

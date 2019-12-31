# Allow only use of the asserts that have no power-assert alternative.

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/prefer-power-assert.md)

- [`t.assert()`](https://github.com/avajs/ava/blob/master/docs/03-assertions.md#assertvalue-message)
- [`t.deepEqual()`](https://github.com/avajs/ava/blob/master/docs/03-assertions.md#deepequalvalue-expected-message)
- [`t.notDeepEqual()`](https://github.com/avajs/ava/blob/master/docs/03-assertions.md#notdeepequalvalue-expected-message)
- [`t.throws()`](https://github.com/avajs/ava/blob/master/docs/03-assertions.md#throwsfn-expected-message)
- [`t.notThrows()`](https://github.com/avajs/ava/blob/master/docs/03-assertions.md#notthrowsfn-message)
- [`t.pass()`](https://github.com/avajs/ava/blob/master/docs/03-assertions.md#passmessage)
- [`t.fail()`](https://github.com/avajs/ava/blob/master/docs/03-assertions.md#failmessage)

Useful for people wanting to fully embrace the power of [power-assert](https://github.com/power-assert-js/power-assert).


## Fail

```js
const test = require('ava');

test(t => {
	t.truthy(foo);
	t.falsy(foo);
	t.true(foo === bar);
	t.false(foo === bar);
	t.is(foo, bar);
	t.not(foo, bar);
	t.regex(foo, bar);
	t.ifError(error);
});
```


## Pass

```js
const test = require('ava');

test(t => {
	t.assert(foo === bar);
	t.deepEqual(foo, bar);
	t.notDeepEqual(foo, bar);
	t.throws(foo);
	t.notThrows(bar);
});
```

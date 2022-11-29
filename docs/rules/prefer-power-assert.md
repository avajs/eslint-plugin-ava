# Enforce the use of the asserts that have no [power-assert](https://github.com/power-assert-js/power-assert) alternative (`ava/prefer-power-assert`)

🚫 This rule is _disabled_ in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/prefer-power-assert.md)

- [`t.assert()`](https://github.com/avajs/ava/blob/main/docs/03-assertions.md#assertvalue-message)
- [`t.deepEqual()`](https://github.com/avajs/ava/blob/main/docs/03-assertions.md#deepequalvalue-expected-message)
- [`t.notDeepEqual()`](https://github.com/avajs/ava/blob/main/docs/03-assertions.md#notdeepequalvalue-expected-message)
- [`t.like()`](https://github.com/avajs/ava/blob/main/docs/03-assertions.md#likevalue-selector-message)
- [`t.throws()`](https://github.com/avajs/ava/blob/main/docs/03-assertions.md#throwsfn-expected-message)
- [`t.notThrows()`](https://github.com/avajs/ava/blob/main/docs/03-assertions.md#notthrowsfn-message)
- [`t.pass()`](https://github.com/avajs/ava/blob/main/docs/03-assertions.md#passmessage)
- [`t.fail()`](https://github.com/avajs/ava/blob/main/docs/03-assertions.md#failmessage)

Useful for people wanting to fully embrace the power of [power-assert](https://github.com/power-assert-js/power-assert).

## Fail

```js
const test = require('ava');

test('foo', t => {
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

test('foo', t => {
	t.assert(foo === bar);
	t.deepEqual(foo, bar);
	t.notDeepEqual(foo, bar);
	t.throws(foo);
	t.notThrows(bar);
});
```

# Allow only use of the asserts that have no power-assert alternative.

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/prefer-power-assert.md)

- [`t.true()`](https://github.com/avajs/ava#truevalue-message)
- [`t.deepEqual()`](https://github.com/avajs/ava#deepequalvalue-expected-message)
- [`t.notDeepEqual()`](https://github.com/avajs/ava#notdeepequalvalue-expected-message)
- [`t.throws()`](https://github.com/avajs/ava#throwsfunctionpromise-error-message)
- [`t.notThrows()`](https://github.com/avajs/ava#notthrowsfunctionpromise-message)
- [`t.pass()`](https://github.com/avajs/ava#passmessage)
- [`t.fail()`](https://github.com/avajs/ava#failmessage)

Useful for people wanting to fully embrace the power of [power-assert](https://github.com/power-assert-js/power-assert).


## Fail

```js
import test from 'ava';

test(t => {
	t.truthy(foo);
	t.falsy(foo);
	t.false(foo === bar);
	t.is(foo, bar);
	t.not(foo, bar);
	t.regex(foo, bar);
	t.ifError(error);
});
```


## Pass

```js
import test from 'ava';

test(t => {
	t.true(foo === bar);
	t.deepEqual(foo, bar);
	t.notDeepEqual(foo, bar);
	t.throws(foo);
	t.notThrows(bar);
});
```

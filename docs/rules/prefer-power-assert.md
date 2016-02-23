# Allow only use of the asserts that have no power-assert alternative.

- [`t.ok()`](https://github.com/sindresorhus/ava#okvalue-message) __(You can do [most things](https://github.com/sindresorhus/ava#enhanced-asserts) with this one)__
- [`t.same()`](https://github.com/sindresorhus/ava#samevalue-expected-message)
- [`t.notSame()`](https://github.com/sindresorhus/ava#notsamevalue-expected-message)
- [`t.throws()`](https://github.com/sindresorhus/ava#throwsfunctionpromise-error-message)
- [`t.notThrows()`](https://github.com/sindresorhus/ava#notthrowsfunctionpromise-message)
- [`t.pass()`](https://github.com/sindresorhus/ava#passmessage)
- [`t.fail()`](https://github.com/sindresorhus/ava#failmessage)

Useful for people wanting to fully embrace the power of [power-assert](https://github.com/power-assert-js/power-assert).


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

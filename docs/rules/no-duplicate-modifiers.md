# Ensure tests do not have duplicate modifiers

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-duplicate-modifiers.md)

Prevent the use of duplicate [test modifiers](https://github.com/avajs/ava/blob/master/docs/01-writing-tests.md).


## Fail

```js
import test from 'ava';

test.only.only(t => {});
test.serial.serial(t => {});
test.cb.cb(t => {});
test.beforeEach.beforeEach(t => {});
test.only.only.cb(t => {});
```


## Pass

```js
import test from 'ava';

test.only(t => {});
test.serial(t => {});
test.cb.only(t => {});
test.beforeEach(t => {});
```

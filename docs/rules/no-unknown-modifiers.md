# Prevent the use of unknown test modifiers

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-unknown-modifiers.md)

Prevent the use of unknown [test modifiers](https://github.com/avajs/ava#api).


## Fail

```js
import test from 'ava';

test.onlu(t => {});
test.seril(t => {});
test.cb.onlu(t => {});
test.beforeeach(t => {});
test.unknown(t => {});
```


## Pass

```js
import test from 'ava';

test.only(t => {});
test.serial(t => {});
test.cb.only(t => {});
test.beforeEach(t => {});
```

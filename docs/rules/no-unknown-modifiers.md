# Prevent the use of unknown test modifiers

Prevent the use of unknown test modifiers.


## Fail

```js
import test = from 'ava';

test.onlu(t => {});
test.seril(t => {});
test.cb.onlu(t => {});
test.beforeeach(t => {});
test.unknown(t => {});
```


## Pass

```js
import test = from 'ava';

test.only(t => {});
test.serial(t => {});
test.cb.only(t => {});
test.beforeEach(t => {});
```

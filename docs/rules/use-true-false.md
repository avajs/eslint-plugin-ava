# Ensure that `t.true()`/`t.false()` are used instead of `t.truthy()`/`t.falsy()`

Translations: [Français](https://github.com/sindresorhus/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/use-true-false.md)

`t.true()` and `t.false()` are stricter in their checks than `t.truthy()` and `t.falsy`.
For example: if you have a function `foo()` which normally returns `true`, but suddenly returns `1` instead, `t.truthy(foo())` would not catch the change, but `t.true(foo())` would.
This rule enforces the use of the former when the tested expression is known to result in a boolean value.

### Fail

```js
import ava from 'ava';

test(t => {
	t.truthy(value < 2);
	t.truthy(value === 1);
	t.falsy([1, 2, 3].indexOf(value) === -1);
	t.falsy(!value);
	t.truthy(!!value);
	t.truthy(Array.isArray(value));
});
```

### Pass

```js
import ava from 'ava';

test(t => {
	t.true(value < 2);
	t.true(value === 1);
	t.false([1, 2, 3].indexOf(value) === -1);
	t.false(!value);
	t.true(!!value);
	t.true(Array.isArray(value));
});
```

# Ensure that `t.true()`/`t.false()` are used instead of `t.truthy()`/`t.falsy()` (`ava/use-true-false`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/use-true-false.md)

`t.true()` and `t.false()` are stricter in their checks than `t.truthy()` and `t.falsy`.
For example: if you have a function `foo()` which normally returns `true`, but suddenly returns `1` instead, `t.truthy(foo())` would not catch the change, but `t.true(foo())` would.
This rule enforces the use of the former when the tested expression is known to result in a boolean value.

### Fail

```js
const ava = require('ava');

test('foo', t => {
	t.truthy(value < 2);
	t.truthy(value === 1);
	t.truthy([1, 2, 3].includes(value));
	t.falsy(!value);
	t.truthy(!!value);
	t.truthy(Array.isArray(value));
});
```

### Pass

```js
const ava = require('ava');

test('foo', t => {
	t.true(value < 2);
	t.true(value === 1);
	t.true([1, 2, 3].includes(value));
	t.false(!value);
	t.true(!!value);
	t.true(Array.isArray(value));
});
```

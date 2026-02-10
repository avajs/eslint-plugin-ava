# ava/no-negated-assertion

📝 Disallow negated assertions.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Using negated arguments in assertions like `t.true(!x)` is harder to read than using the opposite assertion `t.false(x)`. This rule enforces using the positive assertion method instead of negating the argument.

## Examples

```js
import test from 'ava';

test('foo', t => {
	t.true(!value); // ❌
	t.false(value); // ✅

	t.false(!value); // ❌
	t.true(value); // ✅

	t.truthy(!value); // ❌
	t.falsy(value); // ✅

	t.falsy(!value); // ❌
	t.truthy(value); // ✅

	t.true(!!value); // ❌ (double negation is unnecessary)
	t.true(value); // ✅
});
```

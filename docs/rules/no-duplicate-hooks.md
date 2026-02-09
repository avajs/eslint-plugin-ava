# ava/no-duplicate-hooks

📝 Disallow duplicate hook declarations.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Disallow multiple hooks of the same type in a test file.

Registering the same hook type multiple times is usually a copy-paste mistake. Both hooks will run, which is confusing and error-prone. Combine the logic into a single hook instead.

## Examples

```js
import test from 'ava';

// ❌
test.before(t => {
	// setup A
});

test.before(t => {
	// setup B
});

// ✅
test.before(t => {
	// setup A
	// setup B
});
```

# ava/failing-test-url

📝 Require a URL in a comment above `test.failing()`.

🚫 This rule is _disabled_ in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

`test.failing()` marks tests that are expected to fail due to a known bug. Without a link to the issue tracker, it's easy to forget why the test was marked as failing.

This rule requires a comment with a URL (`http://` or `https://`) directly above the `test.failing()` call.

## Examples

```js
import test from 'ava';

// https://github.com/avajs/ava/issues/123
test.failing('foo', t => { // ✅
	t.pass();
});

test.failing('bar', t => { // ❌
	t.pass();
});

// TODO: fix this
test.failing('baz', t => { // ❌ (comment has no URL)
	t.pass();
});
```

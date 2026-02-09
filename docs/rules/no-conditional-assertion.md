# ava/no-conditional-assertion

📝 Disallow assertions inside conditional statements.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Disallow assertions inside conditionals such as `if`/`else`, `switch`, ternary expressions, and `catch` blocks.

If the condition is never met, the assertion never executes and the intended behavior is never verified.

Assertions are allowed when all branches of a conditional contain assertions, since at least one assertion is guaranteed to execute. Assertions inside `catch` blocks are always flagged since the catch may never execute.

## Examples

```js
import test from 'ava';

// ❌
test('main', t => {
	if (something) {
		t.is(value, expected);
	}
});

// ❌
test('main', t => {
	try {
		foo();
	} catch {
		t.pass();
	}
});

// ✅
test('main', t => {
	t.is(value, expected);
});

// ✅ - All branches have assertions
test('main', t => {
	if (process.platform === 'win32') {
		t.is(result, windowsExpected);
	} else {
		t.is(result, unixExpected);
	}
});
```

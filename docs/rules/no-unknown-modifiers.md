# ava/no-unknown-modifiers

📝 Disallow unknown test modifiers.

❌ This rule is [deprecated](https://github.com/avajs/eslint-plugin-ava/blob/v16.0.1/docs/rules/no-unknown-modifiers.md). Replaced by `ava/no-invalid-modifier-chain` which covers more cases.

🚫 This rule is _disabled_ in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-unknown-modifiers.md)

Prevent the use of unknown [test modifiers](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md).

## Examples

```js
import test from 'ava';

test.onlu(t => {}); // ❌
test.only(t => {}); // ✅

test.seril(t => {});  // ❌
test.serial(t => {}); // ✅

test.beforeeach(t => {}); // ❌
test.beforeEach(t => {}); // ✅

test.unknown(t => {}); // ❌

test.always(t => {});       // ❌ `.always` requires `after` or `afterEach`
test.after.always(t => {}); // ✅

test.before.always(t => {});    // ❌ `.always` requires `after` or `afterEach`
test.afterEach.always(t => {}); // ✅
```

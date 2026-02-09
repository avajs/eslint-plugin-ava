# ava/no-invalid-modifier-chain

📝 Disallow invalid modifier chains.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-invalid-modifier-chain.md)

AVA only allows specific [test modifier](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md) chains. Using modifiers in the wrong order, combining incompatible modifiers, or using modifiers that don't apply to a given test type will cause runtime errors.

## Examples

```js
import test from 'ava';

// Wrong order
test.only.serial(t => {});  // ❌
test.serial.only(t => {});  // ✅

test.failing.serial(t => {}); // ❌
test.serial.failing(t => {}); // ✅

// Invalid combinations
test.only.skip(t => {});  // ❌

// Invalid modifiers on hooks
test.before.failing(t => {}); // ❌
test.before.only(t => {});    // ❌
test.before(t => {});         // ✅

// Invalid todo chains
test.todo.failing('title'); // ❌
test.todo('title');         // ✅

// Invalid always usage
test.before.always(t => {});    // ❌ `.always` only works with `after`/`afterEach`
test.after.always(t => {});     // ✅
test.afterEach.always(t => {}); // ✅

// Unknown modifiers
test.foo(t => {}); // ❌
test.cb(t => {});  // ❌

// Duplicates
test.serial.serial(t => {}); // ❌
test.serial(t => {});        // ✅
```

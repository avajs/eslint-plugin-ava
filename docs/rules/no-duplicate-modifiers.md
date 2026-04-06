# ava/no-duplicate-modifiers

📝 Disallow duplicate test modifiers.

❌ This rule is [deprecated](https://github.com/avajs/eslint-plugin-ava/blob/v16.0.0/docs/rules/no-duplicate-modifiers.md). Replaced by `ava/no-invalid-modifier-chain` which covers more cases.

🚫 This rule is _disabled_ in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-duplicate-modifiers.md)

Prevent the use of duplicate [test modifiers](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md).

## Examples

```js
import test from 'ava';

test.only.only(t => {}); // ❌
test.only(t => {}); // ✅

test.serial.serial(t => {}); // ❌
test.serial(t => {}); // ✅

test.beforeEach.beforeEach(t => {}); // ❌
test.beforeEach(t => {}); // ✅
```

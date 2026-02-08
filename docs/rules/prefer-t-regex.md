# ava/prefer-t-regex

📝 Prefer `t.regex()` over `RegExp#test()` and `String#match()`.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/prefer-t-regex.md)

The AVA [`t.regex()` assertion](https://github.com/avajs/ava/blob/main/docs/03-assertions.md#regexcontents-regex-message) can test a string against a regular expression.

This rule will enforce the use of `t.regex()` instead of manually using `RegExp#test()`, which will make your code look clearer and produce better failure output.

This rule is fixable. It will replace the use of `RegExp#test()`, `String#match()`, or `String#search()` with `t.regex()`.

## Examples

```js
import test from 'ava';

test('main', t => {
	t.true(/\w+/.test('foo')); // ❌
	t.truthy('foo'.match(/\w+/)); // ❌
	t.regex('foo', /\w+/); // ✅
});
```

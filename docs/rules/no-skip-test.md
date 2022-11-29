# Ensure no tests are skipped (`ava/no-skip-test`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-skip-test.md)

It's easy to make a test skipped with `test.skip()` and then forget about it. It's visible in the results, but still easily missed.

## Fail

```js
const test = require('ava');

test('foo', t => {
	t.pass();
});

test.skip('bar', t => {
	t.pass();
});
```

## Pass

```js
const test = require('ava');

test('foo', t => {
	t.pass();
});

test('bar', t => {
	t.pass();
});
```

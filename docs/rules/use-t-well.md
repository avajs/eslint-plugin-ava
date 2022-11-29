# Disallow the incorrect use of `t` (`ava/use-t-well`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/use-t-well.md)

Prevent the use of unknown assertion methods and the access to members other than the assertion methods and `.context`, as well as some known misuses of `t`.

This rule is partly fixable. It can fix most misspelled assertion method names and incorrect usages of `.skip`.

## Fail

```js
const test = require('ava');

test('main', t => {
	t(value); // `t` is not a function
	t.depEqual(value, [2]); // Misspelled `.deepEqual` as `.depEqual`, fixable
	t.contxt.foo = 100; // Misspelled `.context` as `.contxt`, fixable
	t.deepEqual.skip.skip(); // Too many chained uses of `.skip`, fixable
	t.skip.deepEqual(1, 1); // `.skip` modifier should be the last in chain, fixable
	t.foo = 1000; // Unknown member `.foo`. Use `.context.foo` instead
	t.deepEqual.is(value, value); // Can't chain assertion methods
	t.skip(); // Missing assertion method
});
```

## Pass

```js
const test = require('ava');

test('main', t => {
	t.deepEqual(value, [2]);
	t.context.a = 100;
	require(`fixtures/${t.title}`);
	t.deepEqual.skip();
});
```

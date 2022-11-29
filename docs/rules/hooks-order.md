# Enforce test hook ordering (`ava/hooks-order`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/hooks-order.md)

Hooks should be placed before any tests and in the proper semantic order:

- `test.before(…);`
- `test.after(…);`
- `test.after.always(…);`
- `test.beforeEach(…);`
- `test.afterEach(…);`
- `test.afterEach.always(…);`
- `test(…);`

This rule is fixable as long as no other code is between the hooks that need to be reordered.

## Fail

```js
const test = require('ava');

test.after(t => {
	doFoo();
});

test.before(t => {
	doFoo();
});

test('foo', t => {
	t.true(true);
});
```

```js
const test = require('ava');

test('foo', t => {
	t.true(true);
});

test.before(t => {
	doFoo();
});
```

## Pass

```js
const test = require('ava');

test.before(t => {
	doFoo();
});

test.after(t => {
	doFoo();
});

test.after.always(t => {
	doFoo();
});

test.beforeEach(t => {
	doFoo();
});

test.afterEach(t => {
	doFoo();
});

test.afterEach.always(t => {
	doFoo();
});

test('foo', t => {
	t.true(true);
});
```

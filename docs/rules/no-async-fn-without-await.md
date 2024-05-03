# Ensure that async tests use `await` (`ava/no-async-fn-without-await`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-async-fn-without-await.md)

AVA comes with built-in support for async functions (async/await). This allows you to write shorter and clearer tests.

Declaring an async test without using the `await` keyword means that either a Promise is not awaited on as intended, or that the function could have been declared as a regular function, which is confusing and slower.

This rule will report an error when it finds an async test which does not use the `await` keyword.

## Fail

```js
const test = require('ava');

test('foo', async t => {
	return foo().then(res => {
		t.is(res, 1);
	});
});
```

## Pass

```js
const test = require('ava');

test('foo', async t => {
	t.is(await foo(), 1);
});
```

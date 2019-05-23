# Ensure no `test.only()` are present

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-only-test.md)

It's easy to run only one test with `test.only()` and then forget about it. It's visible in the results, but still easily missed. Forgetting to remove `.only`, means only this one test in the whole file will run, and if not caught, can let serious bugs slip into your codebase.

This rule is fixable.


## Fail

```js
import test from 'ava';

test.only('test 1', t => {
	t.pass();
});

// test 2 will not run
test('test 2', t => {
	t.pass();
});
```


## Pass

```js
import test from 'ava';

test('test 1', t => {
	t.pass();
});

// test 2 will run
test('test 2', t => {
	t.pass();
});
```

# Prefer using `t.regex()` to test regular expressions

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/prefer-t-regex.md)

The AVA [`t.regex()` assertion](https://github.com/avajs/ava/blob/master/docs/03-assertions.md#regexcontents-regex-message) can test a string against a regular expression.

This rule will enforce the use of `t.regex()` instead of manually using `RegExp#test()`, which will make your code look clearer and produce better failure output.

This rule is fixable. It will replace the use of `RegExp#test()`, `String#match()`, or `String#search()` with `t.regex()`.


## Fail

```js
import test from 'ava';

test('main', t => {
	t.true(/\w+/.test('foo'));
});
```

```js
import test from 'ava';

test('main', t => {
	t.truthy('foo'.match(/\w+/));
});
```


## Pass

```js
import test from 'ava';

test('main', async t => {
	t.regex('foo', /\w+/);
});
```

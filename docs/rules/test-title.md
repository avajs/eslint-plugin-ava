# Ensure tests have a title

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/test-title.md)

Tests should have a title, because test without title would be rejected by AVA since [v1.0.1](https://github.com/avajs/ava/releases/tag/v1.0.1).


## Fail

```js
import test from 'ava';

test(t => {
	t.pass();
});
```


## Pass

```js
import test from 'ava';

test('foo', t => {
	t.pass();
});
```

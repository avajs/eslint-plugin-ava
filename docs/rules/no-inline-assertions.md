# Ensure assertions are not called from an inline function

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-inline-assertions.md)

Prevent assertions being called from an inline function, to make it clear that it does not return.

## Fail
```js
import test from 'ava';

test('foo', t => t.true(fn()));
```

```js
import test from 'ava';

test('foo', t => { t.true(fn()) });
```

```js
import test from 'ava';

test('foo', t => 
	t.true(fn())
);
```

## Pass
```js
import test from 'ava';

test('foo', t => {
	t.true(fn())
});
```

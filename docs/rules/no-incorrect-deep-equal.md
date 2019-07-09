# Avoid using `deepEqual` with primitives

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-incorrect-deep-equal.md)

The `deepEqual` and `notDeepEqual` assertions are unnecessary when comparing primitives. Use `is` or `not` instead.

This rule is fixable.


## Fail

```js
t.deepEqual(expression, 'foo');
t.deepEqual(expression, 1);
t.deepEqual(expression, `foo${bar}`);
t.deepEqual(expression, null);
t.deepEqual(expression, undefined);
t.notDeepEqual(expression, undefined);
```


## Pass

```js
t.is(expression, 'foo');

t.deepEqual(expression, otherExpression);
t.deepEqual(expression, {});
t.deepEqual(expression, []);
t.notDeepEqual(expression, []);
```

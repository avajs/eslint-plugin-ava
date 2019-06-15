# Avoid using `deepEqual` with literals

`deepEqual` and `notDeepEqual` are unnecessary when comparing literals, template strings or `undefined`. Use `is` or `not` instead.

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

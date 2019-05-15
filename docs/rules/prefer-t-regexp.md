# Prefer using `t.regexp` to test regular expression

AVA [regexp assertion](https://github.com/avajs/ava/blob/master/docs/03-assertions.md#regexcontents-regex-message) can test a string against a regular expression.

This rule will enforce the use of that assertion method instead of manually using `.test()` on a regular expression. This will make you code look clearer and produce better output.


## Fail

```js
import test from 'ava';

test(t => {
	t.true(/\w+/.test("foo"));
});
```

```js
import test from 'ava';

test(t => {
	t.truthy("foo".match(/\w+/));
});
```


## Pass

```js
import test from 'ava';

test(async t => {
	t.regexp("foo", /\w+/);
});
```

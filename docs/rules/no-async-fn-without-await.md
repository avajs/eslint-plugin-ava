# Ensure that async tests use `await`

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-async-fn-without-await.md)

AVA comes with built-in support for [async functions](http://www.2ality.com/2016/02/async-functions.html) (async/await). This allows you to write shorter and clearer tests.

Declaring an async test without using the `await` means that either a Promise is not awaited on as intended, or that the function could have be declared as a regular function, which is confusing.

This rule will report an error when it finds an async test which does not use the `await` expression.


## Fail

```js
import test from 'ava';

test(async t => {
	return foo().then(res => {
		t.is(res, 1);
	});
});
```


## Pass

```js
import test from 'ava';

test(async t => {
	t.is(await foo(), 1);
});
```

# Prevent the incorrect use of `t`

Translations: [Français](https://github.com/sindresorhus/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/use-t-well.md)

Prevent the use of unknown assertion methods and the access to members other than the assertion methods and `context`, as well as some known misuses of `t`.


## Fail

```js
import test from 'ava';

test(t => {
	t(value); // `t` is not a function
	t.depEqual(value, [2]); // Unknown assertion method
	t.contxt.foo = 100; // Unknown member `context`
	t.foo = 1000; // Unknown member `foo`. Use `context.foo` instead
	t.deepEqual.is(value, value); // Can't chain assertion methods
	t.skip(); // Missing assertion method
	t.deepEqual.skip.skip(); // Too many chained uses of `skip`
});
```


## Pass

```js
import test from 'ava';

test(t => {
	t.deepEqual(value, [2]);
	t.context.a = 100;
	t.deepEqual.skip();
});
```

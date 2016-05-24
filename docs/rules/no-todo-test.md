# Ensure no `test.todo()` is used

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-todo-test.md)

Disallow the use of `test.todo()`. You might want to do this to only ship features with specs fully written and passing.


## Fail

```js
import test from 'ava';

test.todo('some test');
```


## Pass

```js
import test from 'ava';

test('some test', t => {
	// Some implementation
});
```

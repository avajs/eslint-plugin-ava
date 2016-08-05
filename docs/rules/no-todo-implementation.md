# Ensure `test.todo()` is not given an implementation function

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-todo-implementation.md)

`test.todo` is a method that AVA proposes to enumerate test cases that have yet to be implemented. It is not meant to be passed a function to implement the test, and if given one, AVA will throw an error. If you added an implementation, then you are probably meaning to remove the `todo` modifier.


## Fail

```js
import test from 'ava';

test.todo('title', t => {
	// ...
});

test.todo(t => {
	// ...
});
```


## Pass

```js
import test from 'ava';

test.todo('title');

test(t => {
	// ...
});
```

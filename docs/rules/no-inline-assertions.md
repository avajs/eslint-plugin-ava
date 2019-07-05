# Ensure assertions are not called from inline arrow functions

The test implementation should not purely consist of an inline assertion as assertions do not return a value and having them inline also makes the tests less readable.

This rule is fixable. It will wrap assertions into brackets `{}`. The fixer would not insert extra space or linebreaks around brackets.  


## Fail

```js
import test from 'ava';

test('foo', t => t.true(fn()));
```


## Pass

```js
import test from 'ava';

test('foo', t => {
	t.true(fn())
});
```

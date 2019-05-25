# Ensure no tests are written in ignored files

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-ignored-test-files.md)

This rule will verify that files which create tests are treated as test files by AVA. It will consider the root of the project to be the closest folder containing a `package.json` file, and will not do anything if it can't find one. Test files in `node_modules` will not be linted as they are ignored by ESLint.


## Fail

```js
// File: test/_helper.js
// Invalid because a helper.
import test from 'ava';

test('foo', t => {
	t.pass();
});

// File: lib/foo.js
// Invalid because not a test file.
import test from 'ava';

test('foo', t => {
	t.pass();
});
```


## Pass

```js
// File: test/foo.js
import test from 'ava';

test('foo', t => {
	t.pass();
});
```

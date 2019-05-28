# Ensure no test files are imported anywhere

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-import-test-files.md)

This rule will verify that you don't import any test files. It will consider the root of the project to be the closest folder containing a `package.json` file, and will not do anything if it can't find one. Test files in `node_modules` will not be linted as they are ignored by ESLint.


## Fail

```js
// File: src/index.js
// Invalid because *.test.js is considered as a test file.
import tests from './index.test.js';
```

```js
// File: src/index.js
// Invalid because any files inside __tests__ are considered test files
import tests from './__tests__/index.js';

test('foo', t => {
	t.pass();
});
```


## Pass

```js
// File: src/index.js
import sinon from 'sinon';

```

```js
// File: src/index.js
import utils from './utils';
```

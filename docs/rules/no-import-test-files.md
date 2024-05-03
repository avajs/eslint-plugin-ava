# Ensure no test files are imported anywhere (`ava/no-import-test-files`)

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/avajs/eslint-plugin-ava#recommended-config).

<!-- end auto-generated rule header -->

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/docs/rules/no-import-test-files.md)

This rule will verify that you don't import any test files. It will consider the root of the project to be the closest folder containing a `package.json` file, and will not do anything if it can't find one. Test files in `node_modules` will not be linted as they are ignored by ESLint.

## Fail

```js
// File: src/index.js
// Invalid because *.test.js is considered as a test file.
const tests = require('./index.test.js');
```

```js
// File: src/index.js
// Invalid because any files inside __tests__ are considered test files
const tests = require('./__tests__/index.js');

test('foo', t => {
	t.pass();
});
```

## Pass

```js
// File: src/index.js
const sinon = require('sinon');

```

```js
// File: src/index.js
const utils = require('./utils');
```

## Options

This rule supports the following options:

* `extensions`: an array of extensions of the files that AVA recognizes as test files or helpers. Overrides *both* the `babel.extensions` *and* `extensions` configuration otherwise used by AVA itself.
* `files`: an array of glob patterns to select test files. Overrides the `files` configuration otherwise used by AVA itself.

See also [AVA's configuration](https://github.com/avajs/ava/blob/main/docs/06-configuration.md#options).

You can set the options like this:

```js
"ava/no-import-test-files": ["error", {"files": ["lib/**/*.test.js", "utils/**/*.test.js"]}]
```

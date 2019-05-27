# Ensure no test files are imported anywhere

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/docs/rules/no-import-test-files.md)

This rule will verify that you don't import any test files. It will consider the root of the project to be the closest folder containing a `package.json` file, and will not do anything if it can't find one. Test files in `node_modules` will not be linted as they are ignored by ESLint.

Note that this rule will not be able to warn correctly if you use AVA by specifying the files in the command line ( `ava "lib/**/*.test.js"` ). Prefer configuring AVA as described [here](https://github.com/avajs/ava/blob/master/docs/06-configuration.md).


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

```js
// File: utils/index.js
// with `{"files": ["lib/**/*.test.js", "utils/**/*.test.js"]}`
// in either `package.json` under the `"ava"` key or in the rule options
// Invalid because the imported file matches `lib/**/*.test.js`
import tests from '../lib/index.test.js';

test('foo', t => {
	t.pass();
});
```

```js
// File: utils/index.js
// with `{"extensions": ["js", "mjs"]}`
// in either `package.json` under the `"ava"` key or in the rule options
// Invalid because the imported file extension matches `mjs`
import tests from 'index.test.mjs';

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

```js
// File: lib/index.js
// with `{"files": ["lib/**/*.test.js", "utils/**/*.test.js"]}`
// in either `package.json` under 'ava key' or in the rule options
import utils from 'test.js';
```

```js
// File: lib/index.js
// `with {"extensions": ["js", "mjs"]}`
// in either `package.json` under 'ava key' or in the rule options
import utils from 'test.jsx';
```


## Options

This rule supports the following options:

`files`: An array of strings representing the files glob that AVA will use to find test files. Overrides the default and the configuration found in the `package.json` or `ava.config.js` files.

You can set the options like this:

```json
"ava/no-ignored-test-files": ["error", {"files": ["lib/**/*.test.js", "utils/**/*.test.js"]}]
```

`extensions`: An array of strings representing the file extensions that AVA will use to find the test files. It overrides the default and the configuration found in the `package.json` or `ava.config.js` files.

This extension will filter out files from the `files` option.

You can set the options like this:

```json
"ava/no-ignored-test-files": [
	"error",
	{
		"extensions": [
			"js",
			"mjs"
		]
	}
]
```

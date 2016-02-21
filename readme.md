# eslint-plugin-ava [![Build Status](https://travis-ci.org/sindresorhus/eslint-plugin-ava.svg?branch=master)](https://travis-ci.org/sindresorhus/eslint-plugin-ava)

> **WIP** - ESLint rules for [AVA](https://github.com/sindresorhus/ava)


## Install

```
$ npm install --save-dev eslint eslint-plugin-ava
```


## Usage

Configure it in package.json.

```json
{
	"name": "my-awesome-project",
	"eslintConfig": {
		"plugins": [
			"ava"
		],
		"rules": {
			"ava/no-cb-test": 2,
			"ava/no-identical-title": 2,
			"ava/no-only-test": 2,
			"ava/no-skip-test": 2,
			"ava/test-ended": 2,
			"ava/test-title": [2, "always"]
		}
	}
}
```


## Rules

The rules will only activate in test files.

- [no-cb-test](docs/rules/no-cb-test.md) - Ensure no `test.cb()` is used.
- [no-identical-title](docs/rules/no-identical-title.md) - Ensure no tests have the same title.
- [no-only-test](docs/rules/no-only-test.md) - Ensure no test.only() are present.
- [no-skip-test](docs/rules/no-skip-test.md) - Ensure no tests are skipped.
- [test-ended](docs/rules/test-ended.md) - Ensure callback tests are explicitly ended.
- [test-title](docs/rules/test-title.md) - Ensure tests have a title.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)

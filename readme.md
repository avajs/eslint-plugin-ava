# eslint-plugin-ava [![Build Status](https://travis-ci.org/sindresorhus/eslint-plugin-ava.svg?branch=master)](https://travis-ci.org/sindresorhus/eslint-plugin-ava)

> ESLint rules for [AVA](https://ava.li)


## Install

```
$ npm install --save-dev eslint eslint-plugin-ava
```


## Usage

Configure it in `package.json`.

```json
{
	"name": "my-awesome-project",
	"eslintConfig": {
		"env": {
			"es6": true
		},
		"parserOptions": {
			"ecmaVersion": 6,
			"sourceType": "module"
		},
		"plugins": [
			"ava"
		],
		"rules": {
			"ava/no-cb-test": 0,
			"ava/no-identical-title": 2,
			"ava/no-skip-test": 2,
			"ava/prefer-power-assert": 0,
			"ava/test-ended": 2,
			"ava/test-title": [2, "always"]
		}
	}
}
```


## Rules

The rules will only activate in test files.

- [no-cb-test](docs/rules/no-cb-test.md) - Ensure `test.cb()` is used.
- [no-identical-title](docs/rules/no-identical-title.md) - Ensure no tests have the same title.
- [no-skip-test](docs/rules/no-skip-test.md) - Ensure no tests are skipped.
- [prefer-power-assert](docs/rules/prefer-power-assert.md) - Allow only use of the asserts that have no [power-assert](https://github.com/power-assert-js/power-assert) alternative.
- [test-ended](docs/rules/test-ended.md) - Ensure callback tests are explicitly ended.
- [test-title](docs/rules/test-title.md) - Ensure tests have a title.


## Recommended configuration

This plugin exports a [`recommended` configuration](index.js#L9) that enforces good practices.

To enable this configuration use the `extends` property in your `package.json`.

```json
{
	"name": "my-awesome-project",
	"eslintConfig": {
		"extends": "plugin:ava/recommended",
		"plugins": [
			"ava"
		]
	}
}
```

See [ESLint documentation](http://eslint.org/docs/user-guide/configuring#extending-configuration-files) for more information about extending configuration files.

**Note**: This configuration will also enable the correct [parser options](http://eslint.org/docs/user-guide/configuring#specifying-parser-options) and [environment](http://eslint.org/docs/user-guide/configuring#specifying-environments).


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)

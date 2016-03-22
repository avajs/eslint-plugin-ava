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
			"ava/max-asserts": [2, 5],
			"ava/no-cb-test": 0,
			"ava/no-identical-title": 2,
			"ava/no-invalid-end": 2,
			"ava/no-only-test": 2,
			"ava/no-skip-assert": 2,
			"ava/no-skip-test": 2,
			"ava/no-todo-test": 1,
			"ava/prefer-power-assert": 0,
			"ava/test-ended": 2,
			"ava/test-title": [2, "always"],
			"ava/use-t": 2,
			"ava/use-test": 2
		}
	}
}
```


## Rules

The rules will only activate in test files.

- [max-asserts](docs/rules/max-asserts.md) - Limit the number of assertions in a test.
- [no-cb-test](docs/rules/no-cb-test.md) - Ensure `test.cb()` is used.
- [no-identical-title](docs/rules/no-identical-title.md) - Ensure no tests have the same title.
- [no-invalid-end](docs/rules/no-invalid-end.md) - Ensure `t.end()` is only called inside `test.cb()`.
- [no-only-test](docs/rules/no-only-test.md) - Ensure no `test.only()` are present.
- [no-skip-assert](docs/rules/no-skip-assert.md) - Ensure no assertions are skipped.
- [no-skip-test](docs/rules/no-skip-test.md) - Ensure no tests are skipped.
- [no-statement-after-end](docs/rules/no-statement-after-end.md) - Ensure `t.end()` is the last statement executed.
- [no-todo-test](docs/rules/no-todo-test.md) - Ensure no `test.todo()` is used.
- [prefer-power-assert](docs/rules/prefer-power-assert.md) - Allow only use of the asserts that have no [power-assert](https://github.com/power-assert-js/power-assert) alternative.
- [test-ended](docs/rules/test-ended.md) - Ensure callback tests are explicitly ended.
- [test-title](docs/rules/test-title.md) - Ensure tests have a title.
- [use-t](docs/rules/use-t.md) - Ensure test functions use `t` as their parameter.
- [use-test](docs/rules/use-test.md) - Ensure that AVA is imported with `test` as the variable name.


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


## Credit

- [Jeroen Engels](https://github.com/jfmengels)
- [Takuto Wada](https://github.com/twada)
- [And our awesome contributors](https://github.com/sindresorhus/eslint-plugin-ava/graphs/contributors)


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)

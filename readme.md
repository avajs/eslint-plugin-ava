# eslint-plugin-ava [![Build Status](https://travis-ci.org/avajs/eslint-plugin-ava.svg?branch=master)](https://travis-ci.org/avajs/eslint-plugin-ava) [![Coverage Status](https://coveralls.io/repos/github/avajs/eslint-plugin-ava/badge.svg?branch=master)](https://coveralls.io/github/avajs/eslint-plugin-ava?branch=master)

> ESLint rules for [AVA](https://ava.li)

Translations: [Français](https://github.com/avajs/ava-docs/blob/master/fr_FR/related/eslint-plugin-ava/readme.md)

This plugin is bundled in [XO](https://github.com/sindresorhus/xo). No need to do anything if you're using it.


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
			"ecmaVersion": 2017,
			"sourceType": "module"
		},
		"plugins": [
			"ava"
		],
		"rules": {
			"ava/assertion-arguments": "error",
			"ava/max-asserts": ["off", 5],
			"ava/no-async-fn-without-await": "error",
			"ava/no-cb-test": "off",
			"ava/no-duplicate-modifiers": "error",
			"ava/no-identical-title": "error",
			"ava/no-ignored-test-files": "error",
			"ava/no-invalid-end": "error",
			"ava/no-nested-tests": "error",
			"ava/no-only-test": "error",
			"ava/no-skip-assert": "error",
			"ava/no-skip-test": "error",
			"ava/no-statement-after-end": "error",
			"ava/no-todo-implementation": "error",
			"ava/no-todo-test": "warn",
			"ava/no-unknown-modifiers": "error",
			"ava/prefer-async-await": "error",
			"ava/prefer-power-assert": "off",
			"ava/test-ended": "error",
			"ava/test-title": ["error", "if-multiple"],
			"ava/use-t-well": "error",
			"ava/use-t": "error",
			"ava/use-test": "error",
			"ava/use-true-false": "error"
		}
	}
}
```


## Rules

The rules will only activate in test files.

- [assertion-arguments](docs/rules/assertion-arguments.md) - Enforce passing correct arguments to assertions.
- [max-asserts](docs/rules/max-asserts.md) - Limit the number of assertions in a test.
- [no-async-fn-without-await](docs/rules/no-async-fn-without-await.md) - Ensure that async tests use `await`.
- [no-cb-test](docs/rules/no-cb-test.md) - Ensure no `test.cb()` is used.
- [no-duplicate-modifiers](docs/rules/no-duplicate-modifiers.md) - Ensure tests do not have duplicate modifiers.
- [no-identical-title](docs/rules/no-identical-title.md) - Ensure no tests have the same title.
- [no-ignored-test-files](docs/rules/no-ignored-test-files.md) - Ensure no tests are written in ignored files.
- [no-invalid-end](docs/rules/no-invalid-end.md) - Ensure `t.end()` is only called inside `test.cb()`.
- [no-nested-tests](docs/rules/no-nested-tests.md) - Ensure no tests are nested.
- [no-only-test](docs/rules/no-only-test.md) - Ensure no `test.only()` are present. *(fixable)*
- [no-skip-assert](docs/rules/no-skip-assert.md) - Ensure no assertions are skipped.
- [no-skip-test](docs/rules/no-skip-test.md) - Ensure no tests are skipped. *(fixable)*
- [no-statement-after-end](docs/rules/no-statement-after-end.md) - Ensure `t.end()` is the last statement executed.
- [no-todo-implementation](docs/rules/no-todo-implementation.md) - Ensure `test.todo()` is not given an implementation function.
- [no-todo-test](docs/rules/no-todo-test.md) - Ensure no `test.todo()` is used.
- [no-unknown-modifiers](docs/rules/no-unknown-modifiers.md) - Prevent the use of unknown test modifiers.
- [prefer-async-await](docs/rules/prefer-async-await.md) - Prefer using async/await instead of returning a Promise.
- [prefer-power-assert](docs/rules/prefer-power-assert.md) - Allow only use of the asserts that have no [power-assert](https://github.com/power-assert-js/power-assert) alternative.
- [test-ended](docs/rules/test-ended.md) - Ensure callback tests are explicitly ended.
- [test-title](docs/rules/test-title.md) - Ensure tests have a title.
- [use-t-well](docs/rules/use-t-well.md) - Prevent the incorrect use of `t`.
- [use-t](docs/rules/use-t.md) - Ensure test functions use `t` as their parameter.
- [use-test](docs/rules/use-test.md) - Ensure that AVA is imported with `test` as the variable name.
- [use-true-false](docs/rules/use-true-false.md) - Ensure that `t.true()`/`t.false()` are used instead of `t.truthy()`/`t.falsy()`.


## Recommended config

This plugin exports a [`recommended` config](index.js) that enforces good practices.

Enable it in your `package.json` with the `extends` option:

```json
{
	"name": "my-awesome-project",
	"eslintConfig": {
		"plugins": [
			"ava"
		],
		"extends": "plugin:ava/recommended"
	}
}
```

See the [ESLint docs](http://eslint.org/docs/user-guide/configuring#extending-configuration-files) for more information about extending config files.

**Note**: This config will also enable the correct [parser options](http://eslint.org/docs/user-guide/configuring#specifying-parser-options) and [environment](http://eslint.org/docs/user-guide/configuring#specifying-environments).


## Credit

- [AVA team](https://github.com/avajs/ava#team)
- [Jeroen Engels](https://github.com/jfmengels)
- [Takuto Wada](https://github.com/twada)
- [Contributors…](https://github.com/avajs/eslint-plugin-ava/graphs/contributors)


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)

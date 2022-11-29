# eslint-plugin-ava [![Coverage Status](https://coveralls.io/repos/github/avajs/eslint-plugin-ava/badge.svg?branch=main)](https://coveralls.io/github/avajs/eslint-plugin-ava?branch=main)

> ESLint rules for [AVA](https://avajs.dev)

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/readme.md)

This plugin is bundled in [XO](https://github.com/xojs/xo). No need to do anything if you're using it.

[**Propose or contribute a new rule ➡**](.github/contributing.md)

## Install

```sh
npm install --save-dev eslint eslint-plugin-ava
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
			"ecmaVersion": "latest",
			"sourceType": "module"
		},
		"plugins": [
			"ava"
		],
		"rules": {
			"ava/assertion-arguments": "error",
			"ava/...": "error"
        }
    }
}
```

## Rules

The rules will only activate in test files.

<!-- begin auto-generated rules list -->

💼 [Configurations](https://github.com/avajs/eslint-plugin-ava#recommended-config) enabled in.\
⚠️ [Configurations](https://github.com/avajs/eslint-plugin-ava#recommended-config) set to warn in.\
🚫 [Configurations](https://github.com/avajs/eslint-plugin-ava#recommended-config) disabled in.\
✅ Set in the `recommended` [configuration](https://github.com/avajs/eslint-plugin-ava#recommended-config).\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

| Name                                                                 | Description                                                                                                              | 💼 | ⚠️ | 🚫 | 🔧 | 💡 |
| :------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :- | :- | :- | :- | :- |
| [assertion-arguments](docs/rules/assertion-arguments.md)             | Enforce passing correct arguments to assertions.                                                                         | ✅  |    |    | 🔧 |    |
| [hooks-order](docs/rules/hooks-order.md)                             | Enforce test hook ordering.                                                                                              | ✅  |    |    | 🔧 |    |
| [max-asserts](docs/rules/max-asserts.md)                             | Enforce a limit on the number of assertions in a test.                                                                   |    |    | ✅  |    |    |
| [no-async-fn-without-await](docs/rules/no-async-fn-without-await.md) | Ensure that async tests use `await`.                                                                                     | ✅  |    |    |    |    |
| [no-duplicate-modifiers](docs/rules/no-duplicate-modifiers.md)       | Ensure tests do not have duplicate modifiers.                                                                            | ✅  |    |    |    |    |
| [no-identical-title](docs/rules/no-identical-title.md)               | Ensure no tests have the same title.                                                                                     | ✅  |    |    |    |    |
| [no-ignored-test-files](docs/rules/no-ignored-test-files.md)         | Ensure no tests are written in ignored files.                                                                            | ✅  |    |    |    |    |
| [no-import-test-files](docs/rules/no-import-test-files.md)           | Ensure no test files are imported anywhere.                                                                              | ✅  |    |    |    |    |
| [no-incorrect-deep-equal](docs/rules/no-incorrect-deep-equal.md)     | Disallow using `deepEqual` with primitives.                                                                              | ✅  |    |    | 🔧 |    |
| [no-inline-assertions](docs/rules/no-inline-assertions.md)           | Ensure assertions are not called from inline arrow functions.                                                            | ✅  |    |    | 🔧 |    |
| [no-nested-tests](docs/rules/no-nested-tests.md)                     | Ensure no tests are nested.                                                                                              | ✅  |    |    |    |    |
| [no-only-test](docs/rules/no-only-test.md)                           | Ensure no `test.only()` are present.                                                                                     | ✅  |    |    | 🔧 | 💡 |
| [no-skip-assert](docs/rules/no-skip-assert.md)                       | Ensure no assertions are skipped.                                                                                        | ✅  |    |    |    |    |
| [no-skip-test](docs/rules/no-skip-test.md)                           | Ensure no tests are skipped.                                                                                             | ✅  |    |    | 🔧 | 💡 |
| [no-todo-implementation](docs/rules/no-todo-implementation.md)       | Ensure `test.todo()` is not given an implementation function.                                                            | ✅  |    |    |    |    |
| [no-todo-test](docs/rules/no-todo-test.md)                           | Ensure no `test.todo()` is used.                                                                                         |    | ✅  |    |    |    |
| [no-unknown-modifiers](docs/rules/no-unknown-modifiers.md)           | Disallow the use of unknown test modifiers.                                                                              | ✅  |    |    |    |    |
| [prefer-async-await](docs/rules/prefer-async-await.md)               | Prefer using async/await instead of returning a Promise.                                                                 | ✅  |    |    |    |    |
| [prefer-power-assert](docs/rules/prefer-power-assert.md)             | Enforce the use of the asserts that have no [power-assert](https://github.com/power-assert-js/power-assert) alternative. |    |    | ✅  |    |    |
| [prefer-t-regex](docs/rules/prefer-t-regex.md)                       | Prefer using `t.regex()` to test regular expressions.                                                                    | ✅  |    |    | 🔧 |    |
| [test-title](docs/rules/test-title.md)                               | Ensure tests have a title.                                                                                               | ✅  |    |    |    |    |
| [test-title-format](docs/rules/test-title-format.md)                 | Ensure test titles have a certain format.                                                                                |    |    | ✅  |    |    |
| [use-t](docs/rules/use-t.md)                                         | Ensure test functions use `t` as their parameter.                                                                        | ✅  |    |    |    |    |
| [use-t-throws-async-well](docs/rules/use-t-throws-async-well.md)     | Ensure that `t.throwsAsync()` and `t.notThrowsAsync()` are awaited.                                                      | ✅  |    |    | 🔧 |    |
| [use-t-well](docs/rules/use-t-well.md)                               | Disallow the incorrect use of `t`.                                                                                       | ✅  |    |    | 🔧 |    |
| [use-test](docs/rules/use-test.md)                                   | Ensure that AVA is imported with `test` as the variable name.                                                            | ✅  |    |    |    |    |
| [use-true-false](docs/rules/use-true-false.md)                       | Ensure that `t.true()`/`t.false()` are used instead of `t.truthy()`/`t.falsy()`.                                         | ✅  |    |    |    |    |

<!-- end auto-generated rules list -->

## Recommended config

This plugin exports a [`recommended` config](index.js) that enforces good practices.

Enable it in your `package.json` with the `extends` option:

```json
{
	"name": "my-awesome-project",
	"eslintConfig": {
		"extends": "plugin:ava/recommended"
	}
}
```

See the [ESLint docs](https://eslint.org/docs/user-guide/configuring#extending-configuration-files) for more information about extending config files.

**Note**: This config will also enable the correct [parser options](https://eslint.org/docs/user-guide/configuring#specifying-parser-options) and [environment](https://eslint.org/docs/user-guide/configuring#specifying-environments).

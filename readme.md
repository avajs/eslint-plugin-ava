# eslint-plugin-ava [![Coverage Status](https://coveralls.io/repos/github/avajs/eslint-plugin-ava/badge.svg?branch=main)](https://coveralls.io/github/avajs/eslint-plugin-ava?branch=main)

> ESLint rules for [AVA](https://avajs.dev)

Translations: [Français](https://github.com/avajs/ava-docs/blob/main/fr_FR/related/eslint-plugin-ava/readme.md)

This plugin is bundled in [XO](https://github.com/xojs/xo). No need to do anything if you're using it.

[**Propose or contribute a new rule ➡**](.github/contributing.md)

## Install

```sh
npm install --save-dev eslint eslint-plugin-ava
```

**Requires ESLint `>=10`, [flat config](https://eslint.org/docs/latest/use/configure/configuration-files), and [ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).**

## Usage

Use a [preset config](#recommended-config) or configure each rule in `eslint.config.js`.

```js
import eslintPluginAva from 'eslint-plugin-ava';

export default [
	{
		plugins: {
			ava: eslintPluginAva,
		},
		rules: {
			'ava/assertion-arguments': 'error',
			'ava/no-only-test': 'error',
		},
	},
];
```

## Rules

The rules will only activate in test files.

<!-- begin auto-generated rules list -->

💼 [Configurations](https://github.com/avajs/eslint-plugin-ava#recommended-config) enabled in.\
⚠️ [Configurations](https://github.com/avajs/eslint-plugin-ava#recommended-config) set to warn in.\
🚫 [Configurations](https://github.com/avajs/eslint-plugin-ava#recommended-config) disabled in.\
✅ Set in the `recommended` [configuration](https://github.com/avajs/eslint-plugin-ava#recommended-config).\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).\
❌ Deprecated.

| Name                                                                 | Description                                                                                                    | 💼 | ⚠️ | 🚫 | 🔧 | 💡 | ❌  |
| :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :- | :- | :- | :- | :- | :- |
| [assertion-arguments](docs/rules/assertion-arguments.md)             | Enforce passing correct arguments to assertions.                                                               | ✅  |    |    | 🔧 |    |    |
| [failing-test-url](docs/rules/failing-test-url.md)                   | Require a URL in a comment above `test.failing()`.                                                             |    |    | ✅  |    |    |    |
| [hooks-order](docs/rules/hooks-order.md)                             | Enforce test hook ordering.                                                                                    | ✅  |    |    | 🔧 |    |    |
| [max-asserts](docs/rules/max-asserts.md)                             | Limit the number of assertions in a test.                                                                      |    |    | ✅  |    |    |    |
| [no-async-fn-without-await](docs/rules/no-async-fn-without-await.md) | Require async tests to use `await`.                                                                            | ✅  |    |    |    | 💡 |    |
| [no-ava-in-dependencies](docs/rules/no-ava-in-dependencies.md)       | Disallow AVA in `dependencies`.                                                                                | ✅  |    |    | 🔧 |    |    |
| [no-commented-tests](docs/rules/no-commented-tests.md)               | Disallow commented-out tests.                                                                                  |    | ✅  |    |    |    |    |
| [no-duplicate-hooks](docs/rules/no-duplicate-hooks.md)               | Disallow duplicate hook declarations.                                                                          | ✅  |    |    |    |    |    |
| [no-duplicate-modifiers](docs/rules/no-duplicate-modifiers.md)       | Disallow duplicate test modifiers.                                                                             |    |    | ✅  | 🔧 |    | ❌  |
| [no-identical-title](docs/rules/no-identical-title.md)               | Disallow identical test titles.                                                                                | ✅  |    |    |    |    |    |
| [no-ignored-test-files](docs/rules/no-ignored-test-files.md)         | Disallow tests in ignored files.                                                                               | ✅  |    |    |    |    |    |
| [no-import-test-files](docs/rules/no-import-test-files.md)           | Disallow importing test files.                                                                                 | ✅  |    |    |    |    |    |
| [no-incorrect-deep-equal](docs/rules/no-incorrect-deep-equal.md)     | Disallow using `deepEqual` with primitives.                                                                    | ✅  |    |    | 🔧 |    |    |
| [no-inline-assertions](docs/rules/no-inline-assertions.md)           | Disallow inline assertions.                                                                                    | ✅  |    |    | 🔧 |    |    |
| [no-invalid-modifier-chain](docs/rules/no-invalid-modifier-chain.md) | Disallow invalid modifier chains.                                                                              | ✅  |    |    | 🔧 | 💡 |    |
| [no-nested-assertions](docs/rules/no-nested-assertions.md)           | Disallow nested assertions.                                                                                    | ✅  |    |    |    |    |    |
| [no-nested-tests](docs/rules/no-nested-tests.md)                     | Disallow nested tests.                                                                                         | ✅  |    |    |    |    |    |
| [no-only-test](docs/rules/no-only-test.md)                           | Disallow `test.only()`.                                                                                        | ✅  |    |    |    | 💡 |    |
| [no-skip-assert](docs/rules/no-skip-assert.md)                       | Disallow skipping assertions.                                                                                  | ✅  |    |    |    | 💡 |    |
| [no-skip-test](docs/rules/no-skip-test.md)                           | Disallow skipping tests.                                                                                       | ✅  |    |    |    | 💡 |    |
| [no-todo-implementation](docs/rules/no-todo-implementation.md)       | Disallow giving `test.todo()` an implementation function.                                                      | ✅  |    |    |    | 💡 |    |
| [no-todo-test](docs/rules/no-todo-test.md)                           | Disallow `test.todo()`.                                                                                        |    | ✅  |    |    | 💡 |    |
| [no-unknown-modifiers](docs/rules/no-unknown-modifiers.md)           | Disallow unknown test modifiers.                                                                               |    |    | ✅  |    | 💡 | ❌  |
| [no-useless-t-pass](docs/rules/no-useless-t-pass.md)                 | Disallow useless `t.pass()`.                                                                                   | ✅  |    |    |    |    |    |
| [prefer-async-await](docs/rules/prefer-async-await.md)               | Prefer async/await over returning a Promise.                                                                   | ✅  |    |    |    |    |    |
| [prefer-power-assert](docs/rules/prefer-power-assert.md)             | Enforce using only assertions compatible with [power-assert](https://github.com/power-assert-js/power-assert). |    |    | ✅  |    |    |    |
| [prefer-t-regex](docs/rules/prefer-t-regex.md)                       | Prefer `t.regex()` over `RegExp#test()` and `String#match()`.                                                  | ✅  |    |    | 🔧 |    |    |
| [prefer-t-throws](docs/rules/prefer-t-throws.md)                     | Prefer `t.throws()` or `t.throwsAsync()` over try/catch.                                                       | ✅  |    |    |    |    |    |
| [require-assertion](docs/rules/require-assertion.md)                 | Require that tests contain at least one assertion.                                                             | ✅  |    |    |    |    |    |
| [test-title](docs/rules/test-title.md)                               | Require tests to have a title.                                                                                 | ✅  |    |    |    |    |    |
| [test-title-format](docs/rules/test-title-format.md)                 | Require test titles to match a pattern.                                                                        |    |    | ✅  |    |    |    |
| [use-t](docs/rules/use-t.md)                                         | Require test functions to use `t` as their parameter.                                                          | ✅  |    |    |    |    |    |
| [use-t-throws-async-well](docs/rules/use-t-throws-async-well.md)     | Require `t.throwsAsync()` and `t.notThrowsAsync()` to be awaited.                                              | ✅  |    |    | 🔧 |    |    |
| [use-t-well](docs/rules/use-t-well.md)                               | Disallow incorrect use of `t`.                                                                                 | ✅  |    |    | 🔧 |    |    |
| [use-test](docs/rules/use-test.md)                                   | Require AVA to be imported as `test`.                                                                          | ✅  |    |    |    |    |    |
| [use-true-false](docs/rules/use-true-false.md)                       | Prefer `t.true()`/`t.false()` over `t.truthy()`/`t.falsy()`.                                                   | ✅  |    |    | 🔧 |    |    |

<!-- end auto-generated rules list -->

## Recommended config

This plugin exports a [`recommended` config](index.js) that enforces good practices.

```js
import eslintPluginAva from 'eslint-plugin-ava';

export default [
	...eslintPluginAva.configs.recommended,
];
```

# eslint-plugin-ava [![Build Status](https://travis-ci.org/sindresorhus/eslint-plugin-ava.svg?branch=master)](https://travis-ci.org/sindresorhus/eslint-plugin-ava)

> ESLint rules for [AVA](https://ava.li)


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
			"ava/prefer-power-assert": 0,
			"ava/test-ended": 2
		}
	}
}
```


## Rules

The rules will only activate in test files.

- [test-ended](docs/rules/test-ended.md) - Ensure callback tests are explicitly ended.
- [prefer-power-assert](docs/rules/prefer-power-assert.md) - Allow only use of the asserts that have no [power-assert](https://github.com/power-assert-js/power-assert) alternative.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)

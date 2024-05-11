'use strict';

const path = require('node:path');
const importModules = require('import-modules');
const {name, version} = require('./package.json');

const recommendedRules = {
	'ava/assertion-arguments': 'error',
	'ava/hooks-order': 'error',
	'ava/max-asserts': [
		'off',
		5,
	],
	'ava/no-async-fn-without-await': 'error',
	'ava/no-duplicate-modifiers': 'error',
	'ava/no-identical-title': 'error',
	'ava/no-ignored-test-files': 'error',
	'ava/no-import-test-files': 'error',
	'ava/no-incorrect-deep-equal': 'error',
	'ava/no-inline-assertions': 'error',
	'ava/no-nested-tests': 'error',
	'ava/no-only-test': 'error',
	'ava/no-skip-assert': 'error',
	'ava/no-skip-test': 'error',
	'ava/no-todo-implementation': 'error',
	'ava/no-todo-test': 'warn',
	'ava/no-unknown-modifiers': 'error',
	'ava/prefer-async-await': 'error',
	'ava/prefer-power-assert': 'off',
	'ava/prefer-t-regex': 'error',
	'ava/test-title': 'error',
	'ava/test-title-format': 'off',
	'ava/use-t-well': 'error',
	'ava/use-t': 'error',
	'ava/use-t-throws-async-well': 'error',
	'ava/use-test': 'error',
	'ava/use-true-false': 'error',
};

const plugin = {
	meta: {
		name,
		version,
	},
	rules: importModules(path.resolve(__dirname, 'rules'), {camelize: false}),
	configs: {},
};

Object.assign(plugin.configs, {
	recommended: {
		env: {
			es6: true,
		},
		parserOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		plugins: [
			'ava',
		],
		rules: {
			...recommendedRules,
		},
	},
	'flat/recommended': {
		plugins: {
			ava: plugin,
		},
		rules: {
			...recommendedRules,
		},
	},
});

module.exports = plugin;

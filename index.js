'use strict';
const reqAll = require('req-all');

module.exports = {
	rules: reqAll('rules', {camelize: false}),
	configs: {
		recommended: {
			env: {
				es6: true
			},
			parserOptions: {
				ecmaVersion: 2017,
				sourceType: 'module'
			},
			rules: {
				'ava/assertion-arguments': 'error',
				'ava/assertion-message': ['off', 'always'],
				'ava/max-asserts': ['off', 5],
				'ava/no-async-fn-without-await': 'off',
				'ava/no-cb-test': 'off',
				'ava/no-duplicate-modifiers': 'off',
				'ava/no-identical-title': 'error',
				'ava/no-ignored-test-files': 'error',
				'ava/no-invalid-end': 'error',
				'ava/no-nested-tests': 'error',
				'ava/no-only-test': 'error',
				'ava/no-skip-assert': 'error',
				'ava/no-skip-test': 'error',
				'ava/no-statement-after-end': 'error',
				'ava/no-todo-implementation': 'error',
				'ava/no-todo-test': 'warn',
				'ava/no-unknown-modifiers': 'error',
				'ava/prefer-async-await': 'error',
				'ava/prefer-power-assert': 'off',
				'ava/test-ended': 'error',
				'ava/test-title': ['error', 'if-multiple'],
				'ava/use-t-well': 'error',
				'ava/use-t': 'error',
				'ava/use-test': 'error',
				'ava/use-true-false': 'error'
			}
		}
	}
};

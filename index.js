'use strict';

module.exports = {
	rules: {
		'max-asserts': require('./rules/max-asserts'),
		'no-cb-test': require('./rules/no-cb-test'),
		'no-identical-title': require('./rules/no-identical-title'),
		'no-invalid-end': require('./rules/no-invalid-end'),
		'no-only-test': require('./rules/no-only-test'),
		'no-skip-assert': require('./rules/no-skip-assert'),
		'no-skip-test': require('./rules/no-skip-test'),
		'no-todo-test': require('./rules/no-todo-test'),
		'prefer-power-assert': require('./rules/prefer-power-assert'),
		'test-ended': require('./rules/test-ended'),
		'test-title': require('./rules/test-title')
	},
	configs: {
		recommended: {
			env: {
				es6: true
			},
			parserOptions: {
				ecmaVersion: 6,
				sourceType: 'module'
			},
			rules: {
				'max-asserts': [0, 5],
				'no-cb-test': 0,
				'no-identical-title': 2,
				'no-invalid-end': 2,
				'no-only-test': 2,
				'no-skip-assert': 2,
				'no-skip-test': 2,
				'no-todo-test': 1,
				'prefer-power-assert': 0,
				'test-ended': 2,
				'test-title': [2, 'always']
			}
		}
	}
};

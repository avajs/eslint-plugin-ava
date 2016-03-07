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
		'test-title': require('./rules/test-title'),
		'use-t': require('./rules/use-t'),
		'use-test': require('./rules/use-test')
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
				'ava/max-asserts': [0, 5],
				'ava/no-cb-test': 0,
				'ava/no-identical-title': 2,
				'ava/no-invalid-end': 2,
				'ava/no-only-test': 2,
				'ava/no-skip-assert': 2,
				'ava/no-skip-test': 2,
				'ava/no-todo-test': 1,
				'ava/prefer-power-assert': 0,
				'ava/test-ended': 2,
				'ava/test-title': [2, 'always'],
				'ava/use-t': 2,
				'ava/use-test': 2
			}
		}
	}
};

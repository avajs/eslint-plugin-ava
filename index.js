'use strict';

module.exports = {
	rules: {
		'assertion-message': require('./rules/assertion-message'),
		'max-asserts': require('./rules/max-asserts'),
		'no-cb-test': require('./rules/no-cb-test'),
		'no-identical-title': require('./rules/no-identical-title'),
		'no-ignored-test-files': require('./rules/no-ignored-test-files'),
		'no-invalid-end': require('./rules/no-invalid-end'),
		'no-only-test': require('./rules/no-only-test'),
		'no-skip-assert': require('./rules/no-skip-assert'),
		'no-skip-test': require('./rules/no-skip-test'),
		'no-statement-after-end': require('./rules/no-statement-after-end'),
		'no-todo-test': require('./rules/no-todo-test'),
		'no-unknown-modifiers': require('./rules/no-unknown-modifiers'),
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
				'ava/assertion-message': ['off', 'always'],
				'ava/max-asserts': ['off', 5],
				'ava/no-cb-test': 'off',
				'ava/no-identical-title': 'error',
				'ava/no-ignored-test-files': 'error',
				'ava/no-invalid-end': 'error',
				'ava/no-only-test': 'error',
				'ava/no-skip-assert': 'error',
				'ava/no-skip-test': 'error',
				'ava/no-statement-after-end': 'error',
				'ava/no-todo-test': 'warn',
				'ava/no-unknown-modifiers': 'error',
				'ava/prefer-power-assert': 'off',
				'ava/test-ended': 'error',
				'ava/test-title': ['error', 'if-multiple'],
				'ava/use-t': 'error',
				'ava/use-test': 'error'
			}
		}
	}
};

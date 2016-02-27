'use strict';

module.exports = {
	rules: {
		'no-skip-test': require('./rules/no-skip-test'),
		'prefer-power-assert': require('./rules/prefer-power-assert'),
		'test-ended': require('./rules/test-ended')
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
				'no-skip-test': 0,
				'prefer-power-assert': 0,
				'test-ended': 2
			}
		}
	}
};

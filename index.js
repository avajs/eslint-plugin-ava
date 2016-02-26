'use strict';

module.exports = {
	rules: {
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
				'prefer-power-assert': 0,
				'test-ended': 2
			}
		}
	}
};

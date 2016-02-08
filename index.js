'use strict';

module.exports = {
	rules: {
		'prefer-power-assert': require('./rules/prefer-power-assert'),
		'test-ended': require('./rules/test-ended')
	},
	rulesConfig: {
		'prefer-power-assert': 0,
		'test-ended': 0
	}
};

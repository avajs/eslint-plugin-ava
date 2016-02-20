'use strict';

module.exports = {
	rules: {
		'test-ended': require('./rules/test-ended'),
		'test-title': require('./rules/test-title'),
		'no-skip-test': require('./rules/no-skip-test'),
		'no-only-test': require('./rules/no-only-test')
	},
	rulesConfig: {
		'test-ended': 0,
		'test-title': [0, 'always'],
		'no-skip-test': 0,
		'no-only-test': 0
	}
};

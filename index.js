'use strict';

module.exports = {
	rules: {
		'no-cb-test': require('./rules/no-cb-test'),
		'no-identical-title': require('./rules/no-identical-title')
		'no-only-test': require('./rules/no-only-test'),
		'no-skip-test': require('./rules/no-skip-test'),
		'test-ended': require('./rules/test-ended'),
		'test-title': require('./rules/test-title')
	},
	rulesConfig: {
		'no-cb-test': 0,
		'no-identical-title': 0
		'no-only-test': 0,
		'no-skip-test': 0,
		'test-ended': 0,
		'test-title': [0, 'always']
	}
};

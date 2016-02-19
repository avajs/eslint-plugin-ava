'use strict';

module.exports = {
	rules: {
		'test-ended': require('./rules/test-ended'),
		'test-title': require('./rules/test-title')
	},
	rulesConfig: {
		'test-ended': 0,
		'test-title': [0, 'always']
	}
};

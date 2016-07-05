'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');

module.exports = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			if (ava.hasTestModifier('skip')) {
				context.report({
					node,
					message: 'No tests should be skipped.'
				});
			}
		})
	});
};

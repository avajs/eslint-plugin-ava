'use strict';
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(node => {
			if (ava.hasTestModifier('skip')) {
				context.report({
					node,
					message: 'No tests should be skipped.'
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {}
};

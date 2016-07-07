'use strict';
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(node => {
			if (ava.hasTestModifier('only')) {
				context.report({
					node,
					message: '`test.only()` should not be used.'
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {}
};

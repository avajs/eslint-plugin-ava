'use strict';
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(node => {
			if (ava.hasTestModifier('cb')) {
				context.report({
					node,
					message: '`test.cb()` should be not be used.'
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {}
};

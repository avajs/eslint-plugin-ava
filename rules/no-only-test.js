'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
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

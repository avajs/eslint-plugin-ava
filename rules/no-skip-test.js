'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			const propertyNode = util.getTestModifier(node, 'skip');
			if (propertyNode) {
				context.report({
					node: propertyNode,
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

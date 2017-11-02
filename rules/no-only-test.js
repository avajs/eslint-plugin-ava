'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');
const getTestModifier = require('../util').getTestModifier;

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
					message: '`test.only()` should not be used.',
					fix: fixer => {
						const range = getTestModifier(node, 'only').range.slice();
						range[0] -= 1;
						return fixer.removeRange(range);
					}
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {
		fixable: 'code'
	}
};

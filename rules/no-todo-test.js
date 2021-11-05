'use strict';

const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			if (ava.hasTestModifier('todo')) {
				context.report({
					node,
					message: '`test.todo()` should not be used.',
				});
			}
		}),
	});
};

module.exports = {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			url: util.getDocsUrl(__filename),
		},
		schema: [],
	},
};

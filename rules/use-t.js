'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			const functionArgIndex = node.arguments.length - 1;
			if (functionArgIndex > 1) {
				return;
			}

			const functionArg = node.arguments[functionArgIndex];

			if (!(functionArg && functionArg.params && functionArg.params.length > 0)) {
				return;
			}

			if (functionArg.params.length > 1) {
				context.report({
					node,
					message: 'Test should only have one parameter named `t`.'
				});
			} else if (functionArg.params[0].name !== 't') {
				context.report({
					node,
					message: 'Test parameter should be named `t`.'
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		schema: []
	}
};

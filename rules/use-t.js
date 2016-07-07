'use strict';
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(node => {
			const functionArg = node.arguments[node.arguments.length - 1];

			if (!(functionArg && functionArg.params && functionArg.params.length)) {
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
	meta: {}
};

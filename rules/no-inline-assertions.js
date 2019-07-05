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

			if (!util.isFunctionExpression(functionArg)) {
				return;
			}

			const {body} = functionArg;
			if (body.type === 'CallExpression') {
				context.report({
					node,
					message: 'The test implementation should not be an inline arrow function.',
					fix: fixer => [fixer.insertTextBefore(body, '{'), fixer.insertTextAfter(body, '}')]
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
		type: 'suggestion',
		fixable: 'code'
	}
};

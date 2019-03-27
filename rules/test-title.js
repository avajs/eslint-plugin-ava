'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();
	const functionTypes = [
		'FunctionDeclaration',
		'FunctionExpression',
		'ArrowFunctionExpression'
	];

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
			ava.hasNoHookModifier
		])(node => {
			const firstArgumentIsFunction = node.arguments.length < 1 || functionTypes.includes(node.arguments[0].type);

			if (firstArgumentIsFunction) {
				context.report({
					node,
					message: 'Test should have a title.'
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
		}
	}
};

'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');

const functionExpressions = [
	'FunctionExpression',
	'ArrowFunctionExpression'
];

function isFunction(node) {
	return node &&
		functionExpressions.indexOf(node.type) !== -1;
}

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			if (ava.hasTestModifier('todo') && node.arguments.some(isFunction)) {
				context.report({
					node,
					message: '`test.todo()` should not be passed an implementation function.'
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {}
};

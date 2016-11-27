'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();
	let testIsAsync = false;
	let testUsed = false;

	const registerUseOfAwait = () => {
		if (testIsAsync) {
			testUsed = true;
		}
	};

	const isAsync = node => Boolean(node && node.async);

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			testIsAsync = isAsync(node.arguments[0]) || isAsync(node.arguments[1]);
		}),
		AwaitExpression: registerUseOfAwait,
		YieldExpression: registerUseOfAwait,
		'CallExpression:exit': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			if (testIsAsync && !testUsed) {
				context.report({
					node,
					message: 'Function was declared as `async` but doesn\'t use `await`'
				});
			}
			testIsAsync = false;
			testUsed = false;
		})
	});
};

module.exports = {
	create,
	meta: {}
};

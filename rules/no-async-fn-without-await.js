'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();
	let testIsAsync = false;
	let testUsed = false;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			const implementationFn = node.arguments[0];
			testIsAsync = implementationFn && implementationFn.async;
		}),
		YieldExpression: () => {
			if (testIsAsync) {
				testUsed = true;
			}
		},
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

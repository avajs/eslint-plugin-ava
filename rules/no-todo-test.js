'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			if (ava.hasTestModifier('todo')) {
				context.report({
					node,
					message: '`test.todo()` should be not be used.'
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {
		docs: {
			url: 'https://github.com/avajs/eslint-plugin-ava/tree/master/docs/rules/no-todo-test.md'
		}
	}
};

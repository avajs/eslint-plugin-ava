'use strict';

const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (
				node.parent.type === 'ExpressionStatement'
				&& node.callee.type === 'MemberExpression'
				&& (node.callee.property.name === 'throwsAsync' || node.callee.property.name === 'notThrowsAsync')
				&& node.callee.object.name === 't'
			) {
				const message = `Use \`await\` with \`t.${node.callee.property.name}()\`.`;
				if (ava.isInTestNode().arguments[0].async) {
					context.report({
						node,
						message,
						fix: fixer => fixer.replaceText(node.callee, `await ${context.getSourceCode().getText(node.callee)}`),
					});
				} else {
					context.report({
						node,
						message,
					});
				}
			}
		}),
	});
};

module.exports = {
	create,
	meta: {
		type: 'problem',
		docs: {
			url: util.getDocsUrl(__filename),
		},
		fixable: 'code',
		schema: [],
	},
};

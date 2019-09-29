'use strict';
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			if (
				node.parent.type === 'ExpressionStatement' &&
				node.callee.type === 'MemberExpression' &&
				(node.callee.property.name === 'throwsAsync' || node.callee.property.name === 'notThrowsAsync') &&
				node.callee.object.name === 't'
			) {
				context.report({
					node,
					message: `Use \`await\` with \`t.${node.callee.property.name}()\`.`
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
		type: 'problem'
	}
};

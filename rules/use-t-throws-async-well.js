import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

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
						fix: fixer => fixer.replaceText(node.callee, `await ${context.sourceCode.getText(node.callee)}`),
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

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Ensure that `t.throwsAsync()` and `t.notThrowsAsync()` are awaited.',
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
	},
};

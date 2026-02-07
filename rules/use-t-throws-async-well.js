import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'use-t-throws-async-well';

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
				if (ava.isInTestNode().arguments[0].async) {
					context.report({
						node,
						messageId: MESSAGE_ID,
						data: {method: node.callee.property.name},
						fix: fixer => fixer.replaceText(node.callee, `await ${context.sourceCode.getText(node.callee)}`),
					});
				} else {
					context.report({
						node,
						messageId: MESSAGE_ID,
						data: {method: node.callee.property.name},
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
			description: 'Require `t.throwsAsync()` and `t.notThrowsAsync()` to be awaited.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Use `await` with `t.{{method}}()`.',
		},
	},
};

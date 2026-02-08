import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-nested-assertions';

const create = context => {
	const ava = createAvaRule();
	const assertionCallStack = [];

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (node.callee.type !== 'MemberExpression') {
				return;
			}

			const rootName = util.getNameOfRootNodeObject(node.callee);
			if (!util.isTestObject(rootName)) {
				return;
			}

			const methodName = util.getMembers(node.callee)[0];
			if (!util.assertionMethods.has(methodName)) {
				return;
			}

			if (assertionCallStack.length > 0) {
				context.report({node, messageId: MESSAGE_ID});
			}

			// Don't track `t.try()`, its callback is designed to contain assertions
			if (methodName !== 'try') {
				assertionCallStack.push(node);
			}
		}),
		'CallExpression:exit'(node) {
			if (assertionCallStack.length > 0 && assertionCallStack.at(-1) === node) {
				assertionCallStack.pop();
			}
		},
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow nested assertions.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Assertions should not be nested.',
		},
	},
};

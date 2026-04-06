import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-nested-tests';

const create = context => {
	const ava = createAvaRule();
	const testNodeStack = [];

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			testNodeStack.push(node);
			if (testNodeStack.length >= 2) {
				context.report({
					node,
					messageId: MESSAGE_ID,
				});
			}
		}),

		'CallExpression:exit'(node) {
			if (testNodeStack.length > 0 && testNodeStack.at(-1) === node) {
				testNodeStack.pop();
			}
		},
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow nested tests.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Tests should not be nested.',
		},
	},
};

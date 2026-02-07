import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-inline-assertions';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const functionArgumentIndex = node.arguments.length - 1;
			if (functionArgumentIndex > 1) {
				return;
			}

			const functionArgument = node.arguments[functionArgumentIndex];

			if (!util.isFunctionExpression(functionArgument)) {
				return;
			}

			const {body} = functionArgument;
			if (body.type === 'CallExpression') {
				context.report({
					node,
					messageId: MESSAGE_ID,
					fix: fixer => [fixer.insertTextBefore(body, '{'), fixer.insertTextAfter(body, '}')],
				});
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow inline assertions.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID]: 'The test implementation should not be an inline arrow function.',
		},
	},
};

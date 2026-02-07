import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-skip-test';
const MESSAGE_ID_SUGGESTION = 'no-skip-test-suggestion';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const propertyNode = util.getTestModifier(node, 'skip');
			if (propertyNode) {
				context.report({
					node: propertyNode,
					messageId: MESSAGE_ID,
					suggest: [{
						messageId: MESSAGE_ID_SUGGESTION,
						fix: fixer => fixer.replaceTextRange.apply(null, util.removeTestModifier({
							modifier: 'skip',
							node,
							context,
						})),
					}],
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
			description: 'Disallow skipping tests.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		hasSuggestions: true,
		schema: [],
		messages: {
			[MESSAGE_ID]: 'No tests should be skipped.',
			[MESSAGE_ID_SUGGESTION]: 'Remove the `.skip`.',
		},
	},
};

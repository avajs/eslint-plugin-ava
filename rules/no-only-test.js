import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-only-test';
const MESSAGE_ID_SUGGESTION = 'no-only-test-suggestion';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const propertyNode = util.getTestModifier(node, 'only');
			if (propertyNode) {
				context.report({
					node: propertyNode,
					messageId: MESSAGE_ID,
					suggest: [{
						messageId: MESSAGE_ID_SUGGESTION,
						fix: fixer => fixer.replaceTextRange.apply(null, util.removeTestModifier({
							modifier: 'only',
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
			description: 'Disallow `test.only()`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			[MESSAGE_ID]: '`test.only()` should not be used.',
			[MESSAGE_ID_SUGGESTION]: 'Remove the `.only`.',
		},
	},
};

import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-skip-assert';
const MESSAGE_ID_SUGGESTION = 'no-skip-assert-suggestion';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		MemberExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (node.property.name === 'skip') {
				const root = util.getRootNode(node);
				if (root.object.name === 't' && util.assertionMethods.has(root.property.name)) {
					context.report({
						node,
						messageId: MESSAGE_ID,
						suggest: [{
							messageId: MESSAGE_ID_SUGGESTION,
							fix(fixer) {
								const {sourceCode} = context;
								const dotToken = sourceCode.getTokenBefore(node.property);
								return fixer.removeRange([dotToken.range[0], node.property.range[1]]);
							},
						}],
					});
				}
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow skipping assertions.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			[MESSAGE_ID]: 'No assertions should be skipped.',
			[MESSAGE_ID_SUGGESTION]: 'Remove the `.skip`.',
		},
	},
};

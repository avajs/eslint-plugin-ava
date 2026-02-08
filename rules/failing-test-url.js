import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'failing-test-url';

const urlPattern = /https?:\/\/\S+/;

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const propertyNode = util.getTestModifier(node, 'failing');
			if (!propertyNode) {
				return;
			}

			const comments = context.sourceCode.getCommentsBefore(node.parent);
			const hasUrl = comments.some(comment => urlPattern.test(comment.value));

			if (!hasUrl) {
				context.report({
					node: propertyNode,
					messageId: MESSAGE_ID,
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
			description: 'Require a URL in a comment above `test.failing()`.',
			recommended: false,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: '`test.failing()` requires a URL in a comment above it.',
		},
	},
};

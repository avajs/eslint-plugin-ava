import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-todo-test';
const MESSAGE_ID_SUGGESTION = 'no-todo-test-suggestion';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			if (ava.hasTestModifier('todo')) {
				context.report({
					node,
					messageId: MESSAGE_ID,
					suggest: [{
						messageId: MESSAGE_ID_SUGGESTION,
						fix: fixer => fixer.replaceTextRange(...util.removeTestModifier({
							modifier: 'todo',
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
			description: 'Disallow `test.todo()`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			[MESSAGE_ID]: '`test.todo()` should not be used.',
			[MESSAGE_ID_SUGGESTION]: 'Remove the `.todo`.',
		},
	},
};

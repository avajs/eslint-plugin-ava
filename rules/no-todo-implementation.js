import {visitIf} from 'enhance-visitors';
import {isCommaToken} from '@eslint-community/eslint-utils';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-todo-implementation';
const MESSAGE_ID_REMOVE_TODO = 'no-todo-implementation-remove-todo';
const MESSAGE_ID_REMOVE_IMPLEMENTATION = 'no-todo-implementation-remove-implementation';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			if (ava.hasTestModifier('todo') && node.arguments.some(argument => util.isFunctionExpression(argument))) {
				const {sourceCode} = context;
				const functionArgument = node.arguments.find(argument => util.isFunctionExpression(argument));

				context.report({
					node,
					messageId: MESSAGE_ID,
					suggest: [
						{
							messageId: MESSAGE_ID_REMOVE_TODO,
							fix: fixer => fixer.replaceTextRange(...util.removeTestModifier({
								modifier: 'todo',
								node,
								context,
							})),
						},
						{
							messageId: MESSAGE_ID_REMOVE_IMPLEMENTATION,
							fix(fixer) {
								const commaToken = sourceCode.getTokenBefore(functionArgument, {filter: token => isCommaToken(token)});
								if (commaToken) {
									return fixer.removeRange([commaToken.range[0], functionArgument.range[1]]);
								}

								return fixer.remove(functionArgument);
							},
						},
					],
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
			description: 'Disallow giving `test.todo()` an implementation function.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			[MESSAGE_ID]: '`test.todo()` should not be passed an implementation function.',
			[MESSAGE_ID_REMOVE_TODO]: 'Remove the `.todo` modifier to make it a regular test.',
			[MESSAGE_ID_REMOVE_IMPLEMENTATION]: 'Remove the implementation function to keep it as a todo.',
		},
	},
};

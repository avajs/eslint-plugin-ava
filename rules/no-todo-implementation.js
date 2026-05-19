import createAvaRule, {visitIf} from '../create-ava-rule.js';
import {isCommaToken} from '@eslint-community/eslint-utils';
import util from '../util.js';

const MESSAGE_ID = 'no-todo-implementation';
const MESSAGE_ID_REMOVE_TODO = 'no-todo-implementation-remove-todo';
const MESSAGE_ID_REMOVE_IMPLEMENTATION = 'no-todo-implementation-remove-implementation';

const create = context => {
	const ava = createAvaRule(context.sourceCode);
	const {sourceCode} = context;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			if (!ava.hasTestModifier('todo')) {
				return;
			}

			const implementationArgument = util.getTestImplementationArgument(node, sourceCode);
			if (!util.isLocalImplementationReference(implementationArgument, sourceCode, node)) {
				return;
			}

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
					...(implementationArgument === node.arguments[0]
						? []
						: [{
							messageId: MESSAGE_ID_REMOVE_IMPLEMENTATION,
							fix(fixer) {
								const commaTokenBefore = sourceCode.getTokenBefore(implementationArgument, {filter: token => isCommaToken(token)});
								return fixer.removeRange([commaTokenBefore.range[0], implementationArgument.range[1]]);
							},
						}]),
				],
			});
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

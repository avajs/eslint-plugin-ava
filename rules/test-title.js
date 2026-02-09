import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID_MISSING = 'test-title';
const MESSAGE_ID_NON_STRING = 'non-string-title';
const MESSAGE_ID_EMPTY = 'empty-title';
const MESSAGE_ID_WHITESPACE = 'title-whitespace';
const toStringLiteral = value => JSON.stringify(value);

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
			ava.hasNoUtilityModifier,
		])(node => {
			const firstArgumentIsFunction = node.arguments.length === 0 || util.isFunctionExpression(node.arguments[0]);

			if (firstArgumentIsFunction) {
				context.report({
					node,
					messageId: MESSAGE_ID_MISSING,
				});
				return;
			}

			const firstArgument = node.arguments[0];

			if (firstArgument.type === 'Literal') {
				if (typeof firstArgument.value !== 'string') {
					context.report({
						node: firstArgument,
						messageId: MESSAGE_ID_NON_STRING,
					});
					return;
				}

				if (firstArgument.value.trim() === '') {
					context.report({
						node: firstArgument,
						messageId: MESSAGE_ID_EMPTY,
					});
					return;
				}

				if (firstArgument.value !== firstArgument.value.trim()) {
					const trimmedTitle = firstArgument.value.trim();
					context.report({
						node: firstArgument,
						messageId: MESSAGE_ID_WHITESPACE,
						fix(fixer) {
							return fixer.replaceText(firstArgument, toStringLiteral(trimmedTitle));
						},
					});
				}

				return;
			}

			// Template literal with no expressions
			if (firstArgument.type === 'TemplateLiteral' && firstArgument.expressions.length === 0) {
				const {cooked} = firstArgument.quasis[0].value;

				if (cooked.trim() === '') {
					context.report({
						node: firstArgument,
						messageId: MESSAGE_ID_EMPTY,
					});
					return;
				}

				if (cooked !== cooked.trim()) {
					const trimmedTitle = cooked.trim();
					context.report({
						node: firstArgument,
						messageId: MESSAGE_ID_WHITESPACE,
						fix(fixer) {
							return fixer.replaceText(firstArgument, toStringLiteral(trimmedTitle));
						},
					});
				}
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Require tests to have a title.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID_MISSING]: 'Test should have a title.',
			[MESSAGE_ID_NON_STRING]: 'Test title must be a string.',
			[MESSAGE_ID_EMPTY]: 'Test title must not be empty.',
			[MESSAGE_ID_WHITESPACE]: 'Test title must not have leading or trailing whitespace.',
		},
	},
};

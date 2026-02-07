import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-unknown-modifiers';
const MESSAGE_ID_SUGGESTION = 'no-unknown-modifiers-suggestion';

const modifiers = new Set([
	'after',
	'afterEach',
	'always',
	'before',
	'beforeEach',
	'default',
	'only',
	'serial',
	'skip',
	'todo',
	'failing',
	'macro',
]);

const unknownModifiers = node => util.getTestModifiers(node)
	.filter(modifier => !modifiers.has(modifier.name));

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			for (const modifier of unknownModifiers(node)) {
				context.report({
					node: modifier,
					messageId: MESSAGE_ID,
					data: {name: modifier.name},
					suggest: [{
						messageId: MESSAGE_ID_SUGGESTION,
						data: {name: modifier.name},
						fix: fixer => fixer.replaceTextRange(...util.removeTestModifier({
							modifier: modifier.name,
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
		type: 'problem',
		docs: {
			description: 'Disallow unknown test modifiers.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Unknown test modifier `.{{name}}`.',
			[MESSAGE_ID_SUGGESTION]: 'Remove the `.{{name}}` modifier.',
		},
	},
};

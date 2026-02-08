import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-unknown-modifiers';
const MESSAGE_ID_SUGGESTION = 'no-unknown-modifiers-suggestion';
const MESSAGE_ID_ALWAYS = 'always-without-after';
const MESSAGE_ID_ALWAYS_SUGGESTION = 'always-without-after-suggestion';

const knownModifiers = new Set([
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

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const testModifiers = util.getTestModifiers(node);

			for (const modifier of testModifiers) {
				if (!knownModifiers.has(modifier.name)) {
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
			}

			const alwaysModifier = testModifiers.find(modifier => modifier.name === 'always');

			if (alwaysModifier && !testModifiers.some(modifier => modifier.name === 'after' || modifier.name === 'afterEach')) {
				context.report({
					node: alwaysModifier,
					messageId: MESSAGE_ID_ALWAYS,
					suggest: [{
						messageId: MESSAGE_ID_ALWAYS_SUGGESTION,
						fix: fixer => fixer.replaceTextRange(...util.removeTestModifier({
							modifier: 'always',
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
			[MESSAGE_ID_ALWAYS]: 'The `.always` modifier can only be used with `after` and `afterEach` hooks.',
			[MESSAGE_ID_ALWAYS_SUGGESTION]: 'Remove the `.always` modifier.',
		},
	},
};

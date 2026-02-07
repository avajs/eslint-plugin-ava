import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-unknown-modifiers';

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
			const unknown = unknownModifiers(node);

			if (unknown.length > 0) {
				context.report({
					node: unknown[0],
					messageId: MESSAGE_ID,
					data: {name: unknown[0].name},
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
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Unknown test modifier `.{{name}}`.',
		},
	},
};

import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-todo-implementation';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			if (ava.hasTestModifier('todo') && node.arguments.some(argument => util.isFunctionExpression(argument))) {
				context.report({
					node,
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
			description: 'Disallow giving `test.todo()` an implementation function.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: '`test.todo()` should not be passed an implementation function.',
		},
	},
};

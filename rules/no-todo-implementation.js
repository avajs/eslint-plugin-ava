import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

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
					message: '`test.todo()` should not be passed an implementation function.',
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
			description: 'Ensure `test.todo()` is not given an implementation function.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
	},
};

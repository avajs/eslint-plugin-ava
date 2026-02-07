import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

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
					message: 'Test should have a title.',
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
			description: 'Ensure tests have a title.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
	},
};

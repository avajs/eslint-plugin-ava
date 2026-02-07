import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const propertyNode = util.getTestModifier(node, 'only');
			if (propertyNode) {
				context.report({
					node: propertyNode,
					message: '`test.only()` should not be used.',
					suggest: [{
						desc: 'Remove the `.only`',
						fix: fixer => fixer.replaceTextRange.apply(null, util.removeTestModifier({
							modifier: 'only',
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
			description: 'Ensure no `test.only()` are present.',
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		hasSuggestions: true,
		schema: [],
	},
};

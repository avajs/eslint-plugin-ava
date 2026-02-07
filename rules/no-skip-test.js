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
			const propertyNode = util.getTestModifier(node, 'skip');
			if (propertyNode) {
				context.report({
					node: propertyNode,
					message: 'No tests should be skipped.',
					suggest: [{
						desc: 'Remove the `.skip`',
						fix: fixer => fixer.replaceTextRange.apply(null, util.removeTestModifier({
							modifier: 'skip',
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
			description: 'Ensure no tests are skipped.',
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		hasSuggestions: true,
		schema: [],
	},
};

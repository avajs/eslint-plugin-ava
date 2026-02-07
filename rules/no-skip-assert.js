import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		MemberExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (node.property.name === 'skip') {
				const root = util.getRootNode(node);
				if (root.object.name === 't' && util.assertionMethods.has(root.property.name)) {
					context.report({
						node,
						message: 'No assertions should be skipped.',
					});
				}
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Ensure no assertions are skipped.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
	},
};

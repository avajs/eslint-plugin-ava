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
			const functionArgumentIndex = node.arguments.length - 1;
			if (functionArgumentIndex > 1) {
				return;
			}

			const functionArgument = node.arguments[functionArgumentIndex];

			if (!util.isFunctionExpression(functionArgument)) {
				return;
			}

			const {body} = functionArgument;
			if (body.type === 'CallExpression') {
				context.report({
					node,
					message: 'The test implementation should not be an inline arrow function.',
					fix: fixer => [fixer.insertTextBefore(body, '{'), fixer.insertTextAfter(body, '}')],
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
			description: 'Ensure assertions are not called from inline arrow functions.',
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
	},
};

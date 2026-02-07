import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const create = context => {
	const ava = createAvaRule();
	let nestedCount = 0;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			nestedCount++;
			if (nestedCount >= 2) {
				context.report({
					node,
					message: 'Tests should not be nested.',
				});
			}
		}),

		'CallExpression:exit': visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(() => {
			nestedCount--;
		}),
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Ensure no tests are nested.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
	},
};

import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-duplicate-hooks';

const create = context => {
	const ava = createAvaRule();
	const seen = new Set();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			if (util.hasComputedTestModifier(node)) {
				return;
			}

			const name = util.getHookName(node);
			if (!name) {
				return;
			}

			if (seen.has(name)) {
				context.report({
					node,
					messageId: MESSAGE_ID,
					data: {hook: name},
				});
			} else {
				seen.add(name);
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow duplicate hook declarations.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Duplicate `test.{{hook}}()` hook. Combine the hooks into a single one.',
		},
	},
};

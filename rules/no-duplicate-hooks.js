import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-duplicate-hooks';

const hookNames = new Set(['before', 'after', 'beforeEach', 'afterEach']);

const create = context => {
	const ava = createAvaRule();
	const seen = new Set();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const modifiers = util.getTestModifiers(node).map(property => property.name);

			const hook = modifiers.find(name => hookNames.has(name));
			if (!hook) {
				return;
			}

			const name = (hook === 'after' || hook === 'afterEach') && modifiers.includes('always')
				? `${hook}.always`
				: hook;

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

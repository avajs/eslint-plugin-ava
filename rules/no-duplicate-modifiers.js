import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-duplicate-modifiers';

const sortByName = (a, b) => a.name.localeCompare(b.name);

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const testModifiers = util.getTestModifiers(node).sort(sortByName);

			if (testModifiers.length === 0) {
				return;
			}

			for (let index = 1; index < testModifiers.length; index++) {
				if (testModifiers[index - 1].name === testModifiers[index].name) {
					context.report({
						node: testModifiers[index],
						messageId: MESSAGE_ID,
						data: {name: testModifiers[index].name},
					});
				}
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow duplicate test modifiers.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Duplicate test modifier `.{{name}}`.',
		},
	},
};

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

			const {sourceCode} = context;

			for (let index = 1; index < testModifiers.length; index++) {
				if (testModifiers[index - 1].name === testModifiers[index].name) {
					const duplicate = testModifiers[index];
					context.report({
						node: duplicate,
						messageId: MESSAGE_ID,
						data: {name: duplicate.name},
						fix(fixer) {
							const dotToken = sourceCode.getTokenBefore(duplicate);
							return fixer.removeRange([dotToken.range[0], duplicate.range[1]]);
						},
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
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Duplicate test modifier `.{{name}}`.',
		},
	},
};

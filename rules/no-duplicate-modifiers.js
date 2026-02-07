import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

function sortByName(a, b) {
	if (a.name < b.name) {
		return -1;
	}

	if (a.name > b.name) {
		return 1;
	}

	return 0;
}

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
						message: `Duplicate test modifier \`.${testModifiers[index].name}\`.`,
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
			description: 'Ensure tests do not have duplicate modifiers.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
	},
};

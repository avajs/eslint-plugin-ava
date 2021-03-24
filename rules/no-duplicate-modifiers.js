'use strict';
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

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
			ava.isTestNode
		])(node => {
			const testModifiers = util.getTestModifiers(node).sort(sortByName);

			if (testModifiers.length === 0) {
				return;
			}

			// TODO: Remove `.reduce()` usage.
			// eslint-disable-next-line unicorn/no-array-reduce
			testModifiers.reduce((previous, current) => {
				if (previous.name === current.name) {
					context.report({
						node: current,
						message: `Duplicate test modifier \`.${current.name}\`.`
					});
				}

				return current;
			});
		})
	});
};

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		type: 'problem'
	}
};

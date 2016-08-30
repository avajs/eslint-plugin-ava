'use strict';
const visitIf = require('enhance-visitors').visitIf;
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			const testModifiers = util.getTestModifiers(node).sort();
			if (testModifiers.length === 0) {
				return;
			}

			testModifiers.reduce((prev, current) => {
				if (prev === current) {
					context.report({
						node,
						message: `Duplicate test modifier \`${current}\`.`
					});
				}
				return current;
			});
		})
	});
};

module.exports = {
	create,
	meta: {}
};

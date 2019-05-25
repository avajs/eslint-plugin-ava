'use strict';
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const notAssertionMethods = ['plan', 'end'];

const create = context => {
	const ava = createAvaRule();
	const maxAssertions = context.options[0] || 5;
	let assertionCount = 0;
	let nodeToReport;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			const {callee} = node;

			if (callee.type !== 'MemberExpression') {
				return;
			}

			if (
				callee.property &&
				!notAssertionMethods.includes(callee.property.name) &&
				util.getNameOfRootNodeObject(callee) === 't'
			) {
				const members = util.getMembers(callee).filter(name => name !== 'skip');

				if (!util.assertionMethods.has(members[0])) {
					return;
				}

				assertionCount++;

				if (assertionCount === maxAssertions + 1) {
					nodeToReport = node;
				}
			}
		}),
		'CallExpression:exit': visitIf([ava.isTestNode])(() => {
			// Leaving test function
			if (assertionCount > maxAssertions) {
				context.report({
					node: nodeToReport,
					message: `Expected at most ${maxAssertions} assertions, but found ${assertionCount}.`
				});
			}

			assertionCount = 0;
			nodeToReport = undefined;
		})
	});
};

const schema = [{
	type: 'integer'
}];

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		schema,
		type: 'suggestion'
	}
};

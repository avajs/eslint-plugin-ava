'use strict';

const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const MAX_ASSERTIONS_DEFAULT = 5;

const notAssertionMethods = new Set(['plan', 'end']);

const create = context => {
	const ava = createAvaRule();
	// TODO: Convert options to object JSON Schema default works properly
	// https://github.com/avajs/eslint-plugin-ava/issues/260
	const maxAssertions = context.options[0] || MAX_ASSERTIONS_DEFAULT;
	let assertionCount = 0;
	let nodeToReport;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			const {callee} = node;

			if (callee.type !== 'MemberExpression') {
				return;
			}

			if (
				callee.property
				&& !notAssertionMethods.has(callee.property.name)
				&& util.getNameOfRootNodeObject(callee) === 't'
			) {
				const firstNonSkipMember = util.getMembers(callee).find(name => name !== 'skip');

				if (!util.assertionMethods.has(firstNonSkipMember)) {
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
					message: `Expected at most ${maxAssertions} assertions, but found ${assertionCount}.`,
				});
			}

			assertionCount = 0;
			nodeToReport = undefined;
		}),
	});
};

const schema = [
	{
		type: 'integer',
		default: MAX_ASSERTIONS_DEFAULT,
	},
];

module.exports = {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			url: util.getDocsUrl(__filename),
		},
		schema,
	},
};

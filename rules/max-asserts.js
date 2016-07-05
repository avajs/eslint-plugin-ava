'use strict';
const visitIf = require('enhance-visitors').visitIf;
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const notAssertionMethods = ['plan', 'end'];

module.exports = context => {
	const ava = createAvaRule();
	const maxAssertions = context.options[0] || 5;
	let assertionCount = 0;
	let nodeToReport = null;

	return ava.merge({
		'CallExpression': visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			const callee = node.callee;

			if (callee.type !== 'MemberExpression') {
				return;
			}

			if (callee.property &&
					notAssertionMethods.indexOf(callee.property.name) === -1 &&
					util.nameOfRootObject(callee) === 't') {
				assertionCount++;

				if (assertionCount === maxAssertions + 1) {
					nodeToReport = node;
				}
			}
		}),
		'CallExpression:exit': visitIf([ava.isTestNode])(() => {
			// leaving test function
			if (assertionCount > maxAssertions) {
				context.report({
					node: nodeToReport,
					message: `Expected at most ${maxAssertions} assertions, but found ${assertionCount}.`
				});
			}

			assertionCount = 0;
			nodeToReport = null;
		})
	});
};

module.exports.schema = [{
	type: 'integer'
}];

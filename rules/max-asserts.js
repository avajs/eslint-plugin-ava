'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var notAssertionMethods = ['plan', 'end'];

/* eslint quote-props: [2, "as-needed"] */
module.exports = function (context) {
	var ava = createAvaRule();
	var maxAssertions = context.options[0] || 5;
	var assertionCount = 0;
	var nodeToReport = null;

	return ava.merge({
		CallExpression: function (node) {
			if (!ava.isTestFile || !ava.currentTestNode || node.callee.type !== 'MemberExpression') {
				return;
			}

			var callee = node.callee;

			if (callee.property &&
					notAssertionMethods.indexOf(callee.property.name) === -1 &&
					util.nameOfRootObject(callee) === 't') {
				assertionCount++;

				if (assertionCount === maxAssertions + 1) {
					nodeToReport = node;
				}
			}
		},
		'CallExpression:exit': function (node) {
			if (ava.currentTestNode === node) {
				// leaving test function
				if (assertionCount > maxAssertions) {
					context.report(nodeToReport, 'Expected at most ' + maxAssertions + ' assertions, but found ' + assertionCount);
				}
				assertionCount = 0;
				nodeToReport = null;
			}
		}
	});
};

module.exports.schema = [{
	type: 'integer'
}];

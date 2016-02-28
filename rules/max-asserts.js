'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var notAssertionMethods = ['plan', 'end'];

/* eslint quote-props: [2, "as-needed"] */
module.exports = function (context) {
	var maxAssertions = context.options[0] || 5;
	var assertionCount = 0;

	var ava = createAvaRule();
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
				if (assertionCount > maxAssertions) {
					context.report(node, 'Too many assertions.');
				}
			}
		},
		'CallExpression:exit': function (node) {
			if (ava.currentTestNode === node) {
				// leaving test function
				assertionCount = 0;
			}
		}
	});
};

module.exports.schema = [{
	type: 'integer'
}];

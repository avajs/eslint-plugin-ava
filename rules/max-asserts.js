'use strict';
var util = require('../util');

module.exports = function (context) {
	var maxAssertions = context.options[0] || 5;
	var isTestFile = false;
	var assertionCount = 0;

	return {
		CallExpression: function (node) {
			if (util.isTestFile(node)) {
				isTestFile = true;
				return;
			}

			var callee = node.callee;
			var name = callee.type === 'MemberExpression' ? callee.object.name : callee.name;
			if (name === 'test') {
				assertionCount = 0;
			}
		},

		MemberExpression: function (node) {
			// node.parent.type !== 'MemberExpression' --> don't count `t.skip.is(...)` twice
			if (isTestFile && node.parent.type !== 'MemberExpression' && util.isAssertion(node)) {
				assertionCount++;
				if (assertionCount > maxAssertions) {
					context.report(node, 'Too many assertions.');
				}
			}
		}
	};
};

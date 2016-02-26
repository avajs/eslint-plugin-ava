'use strict';
var createAvaRule = require('../create-ava-rule');

/* eslint quote-props: [2, "as-needed"] */
module.exports = function (context) {
	var endCalled = false;
	var ava = createAvaRule();
	return ava.merge({
		CallExpression: function (node) {
			if (!ava.isTestFile || !ava.currentTestNode || !ava.hasTestModifier('cb')) {
				return;
			}
			var callee = node.callee;
			if (callee.type === 'MemberExpression' && callee.object.name === 't' && callee.property.name === 'end') {
				endCalled = true;
			}
		},
		'CallExpression:exit': function (node) {
			if (!ava.isTestFile || !ava.currentTestNode || !ava.hasTestModifier('cb')) {
				return;
			}
			if (ava.currentTestNode === node) {
				// leaving test function
				if (endCalled) {
					endCalled = false;
				} else {
					context.report(node, 'Callback test was not ended. Make sure to explicitly end the test with `t.end()`.');
				}
			}
		}
	});
};

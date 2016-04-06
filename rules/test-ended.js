'use strict';
var createAvaRule = require('../create-ava-rule');

/* eslint quote-props: [2, "as-needed"] */
module.exports = function (context) {
	var ava = createAvaRule();
	var endCalled = false;

	return ava.merge({
		MemberExpression: function (node) {
			if (!ava.isTestFile || !ava.currentTestNode || !ava.hasTestModifier('cb')) {
				return;
			}

			if (node.object.name === 't' && node.property.name === 'end') {
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

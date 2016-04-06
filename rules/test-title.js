'use strict';
var createAvaRule = require('../create-ava-rule');

/* eslint quote-props: [2, "as-needed"] */
module.exports = function (context) {
	var ava = createAvaRule();
	var ifMultiple = context.options[0] !== 'always';
	var testCount = 0;

	return ava.merge({
		CallExpression: function (node) {
			if (!ava.isTestFile || ava.currentTestNode !== node || ava.hasHookModifier()) {
				return;
			}

			testCount++;

			var requiredLength = ava.hasTestModifier('todo') ? 1 : 2;
			var hasNoTitle = node.arguments.length !== requiredLength;
			var isOverThreshold = !ifMultiple || testCount > 1;

			if (hasNoTitle && isOverThreshold) {
				context.report(node, 'Test should have a title.');
			}
		},
		'Program:exit': function () {
			testCount = 0;
		}
	});
};

module.exports.schema = [{
	enum: ['always', 'if-multiple']
}];

'use strict';
var createAvaRule = require('../create-ava-rule');

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: function (node) {
			if (!ava.isTestFile || ava.currentTestNode !== node) {
				return;
			}

			var functionArg = node.arguments[node.arguments.length - 1];

			if (!functionArg.params || !functionArg.params.length) {
				return;
			}

			if (functionArg.params.length > 1) {
				context.report(node, 'Test should only have one parameter named `t`.');
			} else if (functionArg.params[0].name !== 't') {
				context.report(node, 'Test parameter should be named `t`.');
			}
		}
	});
};

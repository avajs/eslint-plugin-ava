'use strict';
var createAvaRule = require('../create-ava-rule');

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: function (node) {
			if (ava.isTestFile && ava.currentTestNode === node && ava.hasTestModifier('cb')) {
				context.report(node, '`test.cb()` should be not be used.');
			}
		}
	});
};

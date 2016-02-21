'use strict';
var util = require('../util');

module.exports = function (context) {
	var isTestFile = false;

	return {
		CallExpression: function (node) {
			if (util.isTestFile(node)) {
				isTestFile = true;
			}
		},

		MemberExpression: function (node) {
			if (isTestFile && node.property.name === 'only' && util.isCallFromTestObject(node)) {
				context.report(node, 'test.only() should not be used.');
			}
		}
	};
};

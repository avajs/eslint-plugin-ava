'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		MemberExpression: function (node) {
			if (ava.isTestFile &&
					ava.currentTestNode &&
					node.property.name === 'end' &&
					!ava.hasTestModifier('cb') &&
					util.nameOfRootObject(node) === 't') {
				context.report(node, '`t.end()` should only be used inside of `test.cb()`.');
			}
		}
	});
};

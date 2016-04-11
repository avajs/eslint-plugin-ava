'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var booleanBinaryOperators = [
	'==', '===', '!=', '!==', '<', '<=', '>', '>='
];

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: function (node) {
			if (ava.isTestFile &&
					ava.currentTestNode &&
					node.callee.type === 'MemberExpression' &&
					(node.callee.property.name === 'truthy' || node.callee.property.name === 'falsy') &&
					util.nameOfRootObject(node.callee) === 't') {
				var arg = node.arguments[0];

				if (arg &&
						(arg.type === 'BinaryExpression' && booleanBinaryOperators.indexOf(arg.operator) !== -1) ||
						(arg.type === 'UnaryExpression' && arg.operator === '!') ||
						(arg.type === 'Literal' && arg.value === Boolean(arg.value))) {
					if (node.callee.property.name === 'falsy') {
						context.report(node, '`t.false(x)` should be used instead of `t.falsy(x)`');
					} else {
						context.report(node, '`t.true(x)` should be used instead of `t.truthy(x)`');
					}
				}
			}
		}
	});
};

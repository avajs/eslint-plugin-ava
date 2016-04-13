'use strict';
var espree = require('espree');
var espurify = require('espurify');
var deepStrictEqual = require('deep-strict-equal');
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var booleanBinaryOperators = [
	'==', '===', '!=', '!==', '<', '<=', '>', '>='
];

var knownBooleanSignatures = [
	'Array.isArray(x)'
].map(function (signature) {
	return espurify(espree.parse(signature).body[0].expression.callee);
});

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
					(arg.type === 'Literal' && arg.value === Boolean(arg.value)) ||
					(matchesKnownBooleanExpression(arg))
				) {
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

function matchesKnownBooleanExpression(arg) {
	if (arg.type !== 'CallExpression') {
		return false;
	}
	var callee = espurify(arg.callee);
	return knownBooleanSignatures.some(function (signature) {
		return deepStrictEqual(callee, signature);
	});
}

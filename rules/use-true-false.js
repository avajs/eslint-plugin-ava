'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');
var callSignature = require('call-signature');

var booleanBinaryOperators = [
	'==', '===', '!=', '!==', '<', '<=', '>', '>='
];

var knownBooleanSignatures = [
	'Array.isArray(x)'
].map(function (signature) {
	return callSignature.parse(signature).callee;
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
	var callee = arg.callee;
	return knownBooleanSignatures.some(function (signature) {
		return matchesSignature(callee, signature);
	});
}

function matchesSignature(node, sig) {
	if (sig.type === 'Identifier') {
		return isIdentifier(node, sig.name);
	}
	if (sig.type === 'MemberExpression') {
		return node.type === 'MemberExpression' && isIdentifier(node.object, sig.object) && isIdentifier(node.property, sig.member);
	}
}

function isIdentifier(node, expectedName) {
	return node.type === 'Identifier' && node.name === expectedName;
}

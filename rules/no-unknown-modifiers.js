'use strict';
var createAvaRule = require('../create-ava-rule');

var modifiers = [
	'after', 'afterEach', 'before', 'beforeEach',
	'cb', 'only', 'serial', 'skip', 'todo'
];

function getTestModifiers(node) {
	if (node.type === 'CallExpression') {
		return getTestModifiers(node.callee);
	}

	if (node.type === 'MemberExpression') {
		return getTestModifiers(node.object).concat(node.property.name);
	}

	return [];
}

function unknownModifiers(node) {
	return getTestModifiers(node)
		.filter(function (modifier) {
			return modifiers.indexOf(modifier) === -1;
		});
}

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: function (node) {
			if (!ava.isTestFile || ava.currentTestNode !== node) {
				return;
			}

			var unknown = unknownModifiers(node);

			if (unknown.length !== 0) {
				context.report(node, 'Unknown modifier `' + unknown[0] + '`');
			}
		}
	});
};

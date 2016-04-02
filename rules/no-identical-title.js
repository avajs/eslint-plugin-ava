'use strict';
var espurify = require('espurify');
var deepStrictEqual = require('deep-strict-equal');
var createAvaRule = require('../create-ava-rule');

function purify(node) {
	return node && espurify(node);
}

function isStaticTemplateLiteral(node) {
	return node.expressions.every(isStatic);
}

function isStatic(node) {
	return !node ||
		node.type === 'Literal' ||
		(node.type === 'TemplateLiteral' && isStaticTemplateLiteral(node)) ||
		(node.type === 'BinaryExpression' && isStatic(node.left) && isStatic(node.right));
}

function isTitleUsed(usedTitleNodes, titleNode) {
	var purifiedNode = purify(titleNode);

	return usedTitleNodes.some(function (usedTitle) {
		return deepStrictEqual(purifiedNode, usedTitle);
	});
}

/* eslint quote-props: [2, "as-needed"] */
module.exports = function (context) {
	var ava = createAvaRule();
	var usedTitleNodes = [];

	return ava.merge({
		CallExpression: function (node) {
			if (!ava.isTestFile || ava.currentTestNode !== node || ava.hasHookModifier()) {
				return;
			}

			var args = node.arguments;
			var titleNode = args.length > 1 || ava.hasTestModifier('todo') ? args[0] : undefined;

			if (!isStatic(titleNode)) {
				return;
			}

			if (isTitleUsed(usedTitleNodes, titleNode)) {
				context.report(node, 'Test title is used multiple times in the same file.');
				return;
			}

			usedTitleNodes.push(purify(titleNode));
		},
		'Program:exit': function () {
			usedTitleNodes = [];
		}
	});
};

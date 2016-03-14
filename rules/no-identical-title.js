'use strict';
var espurify = require('espurify');
var deepStrictEqual = require('deep-strict-equal');
var createAvaRule = require('../create-ava-rule');

function purify(node) {
	return node && espurify(node);
}

function isTitleUsed(usedTitleNodes, titleNode) {
	var purifiedNode = purify(titleNode);
	return usedTitleNodes.reduce(function (prev, usedTitle) {
		return prev || deepStrictEqual(purifiedNode, usedTitle);
	}, false);
}

/* eslint quote-props: [2, "as-needed"] */
module.exports = function (context) {
	var ava = createAvaRule();
	var usedTitleNodes = [];

	return ava.merge({
		CallExpression: function (node) {
			if (!ava.isTestFile || ava.currentTestNode !== node) {
				return;
			}

			var args = node.arguments;
			var titleNode = args.length > 1 || ava.hasTestModifier('todo') ? args[0] : undefined;
			if (isTitleUsed(usedTitleNodes, titleNode)) {
				context.report(node, 'Test title is used multiple times in the same file.');
				return;
			}

			usedTitleNodes.push(purify(titleNode));
		},
		'Program.exit': function () {
			usedTitleNodes = [];
		}
	});
};

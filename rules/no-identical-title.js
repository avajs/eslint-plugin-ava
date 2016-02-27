'use strict';
var createAvaRule = require('../create-ava-rule');

/* eslint quote-props: [2, "as-needed"] */
module.exports = function (context) {
	var usedTitles = [];

	var ava = createAvaRule();
	return ava.merge({
		CallExpression: function (node) {
			if (!ava.isTestFile || ava.currentTestNode !== node) {
				return;
			}
			var args = node.arguments;
			var title = args.length > 1 ? args[0].value : undefined;
			if (usedTitles.indexOf(title) !== -1) {
				context.report(node, 'Test title is used multiple times in the same file.');
				return;
			}
			usedTitles.push(title);
		},
		'Program.exit': function () {
			usedTitles = [];
		}
	});
};

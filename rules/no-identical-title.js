'use strict';
var util = require('../util');

module.exports = function (context) {
	var isTestFile = false;
	var usedTitles = [];

	return {
		CallExpression: function (node) {
			if (util.isTestFile(node)) {
				isTestFile = true;
				return;
			}

			if (isTestFile) {
				var callee = node.callee;
				var name = callee.type === 'MemberExpression' ? callee.object.name : callee.name;
				if (name === 'test') {
					var args = node.arguments;
					var title = args.length > 1 ? args[0].value : undefined;
					if (usedTitles.indexOf(title) !== -1) {
						context.report(node, 'Test title is used multiple times in the same file.');
						return;
					}
					usedTitles.push(title);
				}
			}
		}
	};
};

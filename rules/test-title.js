'use strict';
var util = require('../util');
var literalTypes = ['Literal', 'TemplateLiteral'];

module.exports = function (context) {
	var ifMultiple = context.options[0] === 'if-multiple';
	var isTestFile = false;
	var testCount = 0;

	return {
		CallExpression: function (node) {
			if (util.isTestFile(node)) {
				isTestFile = true;
				return;
			}

			if (isTestFile) {
				var args = node.arguments;
				var callee = node.callee;
				var name = callee.type === 'MemberExpression' ? callee.object.name : callee.name;
				if (name === 'test') {
					testCount++;
					var hasNoTitle = args.length !== 2 || literalTypes.indexOf(args[0].type) === -1;
					var isOverThreshold = !ifMultiple || testCount > 1;
					if (hasNoTitle && isOverThreshold) {
						context.report(node, 'Test should specify a title.');
					}
				}
			}
		}
	};
};

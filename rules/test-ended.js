'use strict';
var util = require('../util');

module.exports = function (context) {
	var isTestFile = false;

	return {
		CallExpression: function (node) {
			if (util.isTestFile(node)) {
				isTestFile = true;
				return;
			}

			if (isTestFile && util.isTestType(node, 'cb')) {
				var arg = node.arguments[0];

				if (arg && (arg.type === 'FunctionExpression' || arg.type === 'ArrowFunctionExpression')) {
					var fnBody = arg.body.body;

					// TODO: look for `t.end()` recursively
					for (var i = 0; i < fnBody.length; i++) {
						var el = fnBody[i];

						if (el.type === 'ExpressionStatement' && el.expression.type === 'CallExpression') {
							var callee = el.expression.callee;

							if (callee.type === 'MemberExpression' && callee.object.name === 't' && callee.property.name === 'end') {
								// didn't find a top-level `t.end()`
								return;
							}
						}
					}

					context.report(node, 'Callback test was not ended. Make sure to explicitly end the test with `t.end()`.');
				}
			}
		}
	};
};

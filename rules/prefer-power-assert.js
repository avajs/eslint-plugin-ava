'use strict';
var util = require('../util');
/* eslint quote-props: [2, "as-needed"] */

var notAllowed = [
	'notOk',
	'true',
	'false',
	'is',
	'not',
	'regex',
	'ifError'
];

module.exports = function (context) {
	var isTestFile = false;
	var currentTestNode = false;

	return {
		CallExpression: function (node) {
			var callee = node.callee;

			if (util.isTestFile(node)) {
				isTestFile = true;
			}
			if (!isTestFile) {
				return;
			}

			if (callee.type === 'Identifier' && callee.name === 'test') {
				currentTestNode = node;
			} else if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 'test') {
				currentTestNode = node;
			}
			if (!currentTestNode) {
				return;
			}

			if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 't') {
				if (notAllowed.indexOf(callee.property.name) !== -1) {
					context.report(node, 'Only allow use of the assertions that have no power-assert alternative.');
				}
			}
		},
		'CallExpression:exit': function (node) {
			if (currentTestNode === node) {
				currentTestNode = null;
				return;
			}
		}
	};
};

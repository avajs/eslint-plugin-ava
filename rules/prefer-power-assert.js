'use strict';
var util = require('../util');
/* eslint quote-props: [2, "as-needed"] */
var espurify = require('espurify');
var deepStrictEqual = require('deep-strict-equal');

var notAllowed = [
	'notOk',
	'true',
	'false',
	'is',
	'not',
	'regex',
	'ifError'
];

var moduleAst = {
	type: 'ImportDeclaration',
	specifiers: [
		{
			type: 'ImportDefaultSpecifier',
			local: {
				type: 'Identifier',
				name: 'test'
			}
		}
	],
	source: {
		type: 'Literal',
		value: 'ava'
	}
};

module.exports = function (context) {
	var isTestFile = false;
	var currentTestNode = false;

	return {
		ImportDeclaration: function (node) {
			if (deepStrictEqual(espurify(node), moduleAst)) {
				isTestFile = true;
			}
		},
		CallExpression: function (node) {
			var callee = node.callee;

			if (util.isTestFile(node)) {
				isTestFile = true;
			}
			if (!isTestFile) {
				// not in test file
				return;
			}

			if (callee.type === 'Identifier' && callee.name === 'test') {
				currentTestNode = node;
			} else if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 'test') {
				currentTestNode = node;
			}
			if (!currentTestNode) {
				// not in test function
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
		},
		'Program:exit': function () {
			isTestFile = false;
		}
	};
};

'use strict';
var util = require('../util');
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

function isTestFunctionCall(callee) {
	return callee.type === 'Identifier' &&
		callee.name === 'test';
}

function isTestFunctionCallWithSingleModifier(callee) {
	return callee.type === 'MemberExpression' &&
		callee.object.type === 'Identifier' &&
		callee.object.name === 'test';
}

function isTestFunctionCallWithDoubleModifiers(callee) {
	return callee.type === 'MemberExpression' &&
		callee.object.type === 'MemberExpression' &&
		callee.object.object.type === 'Identifier' &&
		callee.object.object.name === 'test';
}

function assertionCalleeAst(methodName) {
	return {
		type: 'MemberExpression',
		object: {
			type: 'Identifier',
			name: 't'
		},
		property: {
			type: 'Identifier',
			name: methodName
		},
		computed: false
	};
}

function skippedAssertionCalleeAst(methodName) {
	return {
		type: 'MemberExpression',
		object: {
			type: 'MemberExpression',
			object: {
				type: 'Identifier',
				name: 't'
			},
			property: {
				type: 'Identifier',
				name: 'skip'
			},
			computed: false
		},
		property: {
			type: 'Identifier',
			name: methodName
		},
		computed: false
	};
}

function isCalleeMatched(callee, methodName) {
	return deepStrictEqual(callee, assertionCalleeAst(methodName)) ||
		deepStrictEqual(callee, skippedAssertionCalleeAst(methodName));
}

/* eslint quote-props: [2, "as-needed"] */
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
			var callee = espurify(node.callee);

			if (util.isTestFile(node)) {
				isTestFile = true;
			}
			if (!isTestFile) {
				// not in test file
				return;
			}

			if (!currentTestNode) {
				if (isTestFunctionCall(callee) ||
					isTestFunctionCallWithSingleModifier(callee) ||
					isTestFunctionCallWithDoubleModifiers(callee)) {
					// entering test function
					currentTestNode = node;
				}
			}
			if (!currentTestNode) {
				// not in test function
				return;
			}

			if (callee.type === 'MemberExpression') {
				notAllowed.forEach(function (methodName) {
					if (isCalleeMatched(callee, methodName)) {
						context.report(node, 'Only allow use of the assertions that have no power-assert alternative.');
					}
				});
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

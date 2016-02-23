'use strict';
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

var avaImportDeclarationAst = {
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

var avaVariableDeclaratorAst = {
	type: 'VariableDeclarator',
	id: {
		type: 'Identifier',
		name: 'test'
	},
	init: {
		type: 'CallExpression',
		callee: {
			type: 'Identifier',
			name: 'require'
		},
		arguments: [
			{
				type: 'Literal',
				value: 'ava'
			}
		]
	}
};

function isTestFunctionCall(node) {
	if (node.type === 'Identifier') {
		return node.name === 'test';
	} else if (node.type === 'MemberExpression') {
		return isTestFunctionCall(node.object);
	}
	return false;
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
	var currentTestNode = null;

	return {
		ImportDeclaration: function (node) {
			if (!isTestFile && deepStrictEqual(espurify(node), avaImportDeclarationAst)) {
				isTestFile = true;
			}
		},
		VariableDeclarator: function (node) {
			if (!isTestFile && deepStrictEqual(espurify(node), avaVariableDeclaratorAst)) {
				isTestFile = true;
			}
		},
		CallExpression: function (node) {
			if (!isTestFile) {
				// not in test file
				return;
			}

			var callee = espurify(node.callee);

			if (!currentTestNode) {
				if (isTestFunctionCall(callee)) {
					// entering test function
					currentTestNode = node;
				}
				// not in test function
				return;
			}

			if (callee.type === 'MemberExpression') {
				notAllowed.forEach(function (methodName) {
					if (isCalleeMatched(callee, methodName)) {
						context.report(node, 'Only asserts with no power-assert alternative are allowed.');
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

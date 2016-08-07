'use strict';
const espurify = require('espurify');
const enhance = require('enhance-visitors');
const deepStrictEqual = require('deep-strict-equal');

const avaImportDeclarationAst = {
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

const avaVariableDeclaratorAst = {
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

function hasTestModifier(node, mod) {
	if (node.type === 'CallExpression') {
		return hasTestModifier(node.callee, mod);
	} else if (node.type === 'MemberExpression') {
		if (node.property.type === 'Identifier' && node.property.name === mod) {
			return true;
		}

		return hasTestModifier(node.object, mod);
	}

	return false;
}

module.exports = () => {
	let isTestFile = false;
	let currentTestNode = null;

	/* eslint quote-props: [2, "as-needed"] */
	const predefinedRules = {
		ImportDeclaration: node => {
			if (!isTestFile && deepStrictEqual(espurify(node), avaImportDeclarationAst)) {
				isTestFile = true;
			}
		},
		VariableDeclarator: node => {
			if (!isTestFile && deepStrictEqual(espurify(node), avaVariableDeclaratorAst)) {
				isTestFile = true;
			}
		},
		CallExpression: node => {
			if (isTestFunctionCall(node.callee)) {
				// entering test function
				currentTestNode = node;
			}
		},
		'CallExpression:exit': node => {
			if (currentTestNode === node) {
				// leaving test function
				currentTestNode = null;
			}
		},
		'Program:exit': () => {
			isTestFile = false;
		}
	};

	return {
		hasTestModifier: mod => hasTestModifier(currentTestNode, mod),
		hasNoHookModifier: () => !hasTestModifier(currentTestNode, 'before') &&
				!hasTestModifier(currentTestNode, 'beforeEach') &&
				!hasTestModifier(currentTestNode, 'after') &&
				!hasTestModifier(currentTestNode, 'afterEach'),
		isInTestFile: () => isTestFile,
		isInTestNode: () => currentTestNode,
		isTestNode: node => currentTestNode === node,
		merge: customHandlers => {
			return enhance.mergeVisitors([predefinedRules, customHandlers]);
		}
	};
};

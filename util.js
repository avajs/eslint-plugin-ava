'use strict';
const fs = require('fs');

const functionExpressions = [
	'FunctionExpression',
	'ArrowFunctionExpression'
];

exports.nameOfRootObject = node => {
	if (node.object.type === 'MemberExpression') {
		return exports.nameOfRootObject(node.object);
	}

	return node.object.name;
};

exports.isInContext = node => {
	if (node.object.type === 'MemberExpression') {
		return exports.isInContext(node.object);
	}

	return node.property.name === 'context';
};

exports.getAvaConfig = filepath => {
	const defaultResult = {};

	if (!filepath) {
		return defaultResult;
	}

	try {
		const packageContent = JSON.parse(fs.readFileSync(filepath, 'utf8'));
		return (packageContent && packageContent.ava) || defaultResult;
	} catch (err) {
		return defaultResult;
	}
};

exports.isFunctionExpression = node => {
	return node && functionExpressions.indexOf(node.type) !== -1;
};

exports.getTestModifiers = function getTestModifiers(node) {
	if (node.type === 'CallExpression') {
		return getTestModifiers(node.callee);
	}

	if (node.type === 'MemberExpression') {
		return getTestModifiers(node.object).concat(node.property.name);
	}

	return [];
};

const getMembers = node => {
	const name = node.property.name;

	if (node.object.type === 'MemberExpression') {
		return getMembers(node.object).concat(name);
	}

	return [name];
};

exports.getMembers = getMembers;

const assertionMethodsNumArguments = new Map([
	['deepEqual', 2],
	['fail', 0],
	['false', 1],
	['falsy', 1],
	['ifError', 1],
	['is', 2],
	['not', 2],
	['notDeepEqual', 2],
	['notThrows', 1],
	['pass', 0],
	['regex', 2],
	['notRegex', 2],
	['snapshot', 1],
	['throws', 1],
	['true', 1],
	['truthy', 1]
]);

const assertionMethodNames = Array.from(assertionMethodsNumArguments.keys());

exports.assertionMethodsNumArguments = assertionMethodsNumArguments;
exports.assertionMethods = new Set(assertionMethodNames);
exports.executionMethods = new Set(assertionMethodNames.concat(['end', 'plan']));

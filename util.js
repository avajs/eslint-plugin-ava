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

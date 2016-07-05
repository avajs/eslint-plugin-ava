'use strict';
const fs = require('fs');

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

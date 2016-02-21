'use strict';

function hasRequire(callExp, moduleId) {
	if (callExp.callee.name !== 'require') {
		return false;
	}

	var arg = callExp.arguments[0];

	return arg && arg.type === 'Literal' && arg.value === moduleId;
}

exports.isTestFile = function (callExp) {
	// TODO: also support `import`
	return hasRequire(callExp, 'ava');
};

exports.isTestType = function (callExp, type) {
	var callee = callExp.callee;

	// TODO: needs to handle `.cb` being in any nesting on the object
	return callee.type === 'MemberExpression' &&
		callee.object.name === 'test' &&
		callee.property.name === type;
};

function nameOfRootObject(node) {
	if (node.object.type === 'MemberExpression') {
		return nameOfRootObject(node.object);
	}
	return node.object.name;
}

exports.nameOfRootObject = nameOfRootObject;

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

/**
 * Checks whether the given MemberExpression node has `test` as the root object.
 * @param {ASTNode} node Node of type MemberExpression
 * @example
 *   isCallFromTestObject(toASTNode('a.b.c.d()'))
 *   // => false
 *   isCallFromTestObject(toASTNode('test.cb.skip()'))
 *   // => true
 * @return {Boolean}
 */
exports.isCallFromTestObject = function isCallFromTestObject(node) {
	if (node.object.type === 'MemberExpression') {
		return isCallFromTestObject(node.object);
	}
	return node.object.name === 'test';
}

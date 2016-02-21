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
exports.isCallFromTestObject = function (node) {
	return nameOfRootObject(node) === 'test';
};

/**
 * Checks whether the given MemberExpression node is an assertion.
 * Expects the assertion object to be `t`.
 * Doesn't count `t.plan()` and `t.end()` as assertions.
 * @param {ASTNode} node Node of type MemberExpression
 * @example
 *   isAssertion(toASTNode('t.is(1, 1)'))
 *   // => true
 *   isAssertion(toASTNode('test.is(1, 1)'))
 *   // => false
 *   isAssertion(toASTNode('t.plan(5)'))
 *   // => false
 *   isAssertion(toASTNode('t.end()'))
 *   // => false
 * @return {Boolean}
 */
exports.isAssertion = function (node) {
	const notAssertionMethods = ['plan', 'end'];

	return nameOfRootObject(node) === 't' && notAssertionMethods.indexOf(node.property.name) === -1;
};

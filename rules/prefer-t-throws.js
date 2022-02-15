'use strict';

const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

// This function checks if there is an AwaitExpression, which is not inside another function.
//
// TODO: find a simpler way to do this
function hasAwaitExpression(nodes) {
	if (!nodes) {
		return false;
	}

	for (const node of nodes) {
		if (!node) {
			continue;
		}

		if (node.type === 'ExpressionStatement' && hasAwaitExpression([node.expression])) {
			return true;
		}

		if (node.type === 'AwaitExpression') {
			return true;
		}

		if (node.expressions && hasAwaitExpression(node.expressions)) {
			return true;
		}

		if (node.type === 'BlockStatement' && hasAwaitExpression(node.body)) {
			return true;
		}

		if (node.type === 'MemberExpression' && hasAwaitExpression([node.object, node.property])) {
			return true;
		}

		if ((node.type === 'CallExpression' || node.type === 'NewExpression')
				&& hasAwaitExpression([...node.arguments, node.callee])) {
			return true;
		}

		if (node.left && node.right && hasAwaitExpression([node.left, node.right])) {
			return true;
		}

		if (node.type === 'SequenceExpression' && hasAwaitExpression(node.expressions)) {
			return true;
		}

		if (node.type === 'VariableDeclaration'
				&& hasAwaitExpression(node.declarations.map(declaration => declaration.init))) {
			return true;
		}

		if (node.type === 'ThrowStatement' && hasAwaitExpression([node.argument])) {
			return true;
		}

		if (node.type === 'IfStatement' && hasAwaitExpression([node.test, node.consequent, node.alternate])) {
			return true;
		}

		if (node.type === 'SwitchStatement'
				// eslint-disable-next-line unicorn/prefer-spread
				&& hasAwaitExpression([node.discriminant, ...node.cases.flatMap(caseNode => [caseNode.test].concat(caseNode.consequent))])) {
			return true;
		}

		if (node.type.endsWith('WhileStatement') && hasAwaitExpression([node.test, node.body])) {
			return true;
		}

		if (node.type === 'ForStatement' && hasAwaitExpression([node.init, node.test, node.update, node.body])) {
			return true;
		}

		if (node.type === 'ForInStatement' && hasAwaitExpression([node.right, node.body])) {
			return true;
		}

		if (node.type === 'ForOfStatement' && (node.await || hasAwaitExpression([node.right, node.body]))) {
			return true;
		}

		if (node.type === 'WithStatement' && hasAwaitExpression([node.object, node.body])) {
			return true;
		}
	}

	return false;
}

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		TryStatement: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			const nodes = node.block.body;
			if (nodes.length < 2) {
				return;
			}

			const tFailIndex = [...nodes].reverse().findIndex(node => node.type === 'ExpressionStatement'
				&& node.expression.type === 'CallExpression'
				&& node.expression.callee.object
				&& node.expression.callee.object.name === 't'
				&& node.expression.callee.property
				&& node.expression.callee.property.name === 'fail');

			// Return if there is no t.fail() or if it's the first node
			if (tFailIndex === -1 || tFailIndex === nodes.length - 1) {
				return;
			}

			const beforeNodes = nodes.slice(0, nodes.length - 1 - tFailIndex);

			context.report({
				node,
				message: `Prefer using the \`t.throws${hasAwaitExpression(beforeNodes) ? 'Async' : ''}()\` assertion.`,
			});
		}),
	});
};

module.exports = {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			url: util.getDocsUrl(__filename),
		},
		schema: [],
	},
};

import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID_SYNC = 'prefer-t-throws';
const MESSAGE_ID_ASYNC = 'prefer-t-throws-async';

function findTFailIndex(body) {
	function getCallExpression(statement) {
		if (
			statement.type === 'ExpressionStatement'
			&& statement.expression.type === 'CallExpression'
		) {
			return statement.expression;
		}

		if (
			statement.type === 'ExpressionStatement'
			&& statement.expression.type === 'AwaitExpression'
			&& statement.expression.argument.type === 'CallExpression'
		) {
			return statement.expression.argument;
		}

		if (
			statement.type === 'ReturnStatement'
			&& statement.argument?.type === 'CallExpression'
		) {
			return statement.argument;
		}

		if (
			statement.type === 'ReturnStatement'
			&& statement.argument?.type === 'AwaitExpression'
			&& statement.argument.argument.type === 'CallExpression'
		) {
			return statement.argument.argument;
		}

		return undefined;
	}

	for (const [index, statement] of body.entries()) {
		const callExpression = getCallExpression(statement);
		if (callExpression?.callee.type === 'MemberExpression') {
			const {callee} = callExpression;
			const rootName = util.getNameOfRootNodeObject(callee);

			if (
				util.isTestObject(rootName)
				&& !util.isPropertyUnderContext(callee)
			) {
				const members = util.getMembers(callee);
				const firstNonSkipMember = members.find(name => name !== 'skip');
				if (firstNonSkipMember === 'fail') {
					return index;
				}
			}
		}
	}

	return -1;
}

function hasDirectAwait(node) {
	if (!node || typeof node !== 'object') {
		return false;
	}

	if (node.type === 'AwaitExpression') {
		return true;
	}

	// `for await...of` is a ForOfStatement with `await: true`, not an AwaitExpression
	if (node.type === 'ForOfStatement' && node.await) {
		return true;
	}

	// Don't descend into nested function scopes
	if (
		node.type === 'FunctionExpression'
		|| node.type === 'ArrowFunctionExpression'
		|| node.type === 'FunctionDeclaration'
	) {
		return false;
	}

	for (const key of Object.keys(node)) {
		if (key === 'parent') {
			continue;
		}

		const child = node[key];

		if (Array.isArray(child)) {
			if (child.some(element => hasDirectAwait(element))) {
				return true;
			}
		} else if (child && typeof child === 'object' && child.type && hasDirectAwait(child)) {
			return true;
		}
	}

	return false;
}

function referencesIdentifier(node, identifierName) {
	if (!node || typeof node !== 'object') {
		return false;
	}

	if (node.type === 'Identifier' && node.name === identifierName) {
		return true;
	}

	// Don't descend into nested function scopes
	if (
		node.type === 'FunctionExpression'
		|| node.type === 'ArrowFunctionExpression'
		|| node.type === 'FunctionDeclaration'
	) {
		return false;
	}

	for (const key of Object.keys(node)) {
		if (key === 'parent') {
			continue;
		}

		const child = node[key];
		if (Array.isArray(child)) {
			if (child.some(element => referencesIdentifier(element, identifierName))) {
				return true;
			}
		} else if (child && typeof child === 'object' && child.type && referencesIdentifier(child, identifierName)) {
			return true;
		}
	}

	return false;
}

function getSingleTryStatement(node) {
	if (!node?.block?.body || node.block.body.length !== 1) {
		return undefined;
	}

	const statement = node.block.body[0];
	// Basic "might throw" patterns: `foo()` / `await foo()` / `return foo()` / `return await foo()`
	if (statement.type === 'ExpressionStatement') {
		return statement.expression;
	}

	if (statement.type === 'ReturnStatement') {
		return statement.argument;
	}

	return undefined;
}

function isTryCatchAssertsOnErrorPattern(node) {
	if (!node.handler?.param || node.handler.param.type !== 'Identifier') {
		return false;
	}

	const tryExpression = getSingleTryStatement(node);
	if (!tryExpression) {
		return false;
	}

	// Require an actual call or awaited call.
	const callExpression = tryExpression.type === 'AwaitExpression' ? tryExpression.argument : tryExpression;
	if (!callExpression || callExpression.type !== 'CallExpression') {
		return false;
	}

	const catchStatements = node.handler.body?.body;
	if (!catchStatements || catchStatements.length === 0) {
		return false;
	}

	// Don't flag if the catch block rethrows/returns (might be real error handling).
	if (catchStatements.some(statement => statement.type === 'ThrowStatement' || statement.type === 'ReturnStatement')) {
		return false;
	}

	const errorName = node.handler.param.name;

	// Only flag if the catch block actually inspects the caught error.
	return catchStatements.some(statement => referencesIdentifier(statement, errorName));
}

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		TryStatement: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (!node.handler) {
				return;
			}

			const tFailIndex = findTFailIndex(node.block.body);

			// Primary pattern: try block contains throwing code followed by direct `t.fail()`.
			if (tFailIndex >= 1) {
				const statementsBeforeFail = node.block.body.slice(0, tFailIndex);
				const isAsync = statementsBeforeFail.some(statement => hasDirectAwait(statement));

				context.report({
					node,
					messageId: isAsync ? MESSAGE_ID_ASYNC : MESSAGE_ID_SYNC,
				});
				return;
			}

			// Secondary pattern (issue #156): try block runs a single (possibly awaited) call,
			// catch block asserts on the caught error (without rethrow/return).
			if (isTryCatchAssertsOnErrorPattern(node)) {
				const tryExpression = getSingleTryStatement(node);
				const isAsync = hasDirectAwait(tryExpression);

				context.report({
					node,
					messageId: isAsync ? MESSAGE_ID_ASYNC : MESSAGE_ID_SYNC,
				});
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Prefer `t.throws()` or `t.throwsAsync()` over try/catch.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID_SYNC]: 'Use `t.throws()` instead of try/catch.',
			[MESSAGE_ID_ASYNC]: 'Use `t.throwsAsync()` instead of try/catch.',
		},
	},
};

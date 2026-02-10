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

			// No t.fail() found, or it's the first statement (no throwing code before it)
			if (tFailIndex < 1) {
				return;
			}

			const statementsBeforeFail = node.block.body.slice(0, tFailIndex);
			const isAsync = statementsBeforeFail.some(statement => hasDirectAwait(statement));

			context.report({
				node,
				messageId: isAsync ? MESSAGE_ID_ASYNC : MESSAGE_ID_SYNC,
			});
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

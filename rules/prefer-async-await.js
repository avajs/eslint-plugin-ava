import createAvaRule, {visitIf} from '../create-ava-rule.js';
import {findVariable} from '@eslint-community/eslint-utils';
import util from '../util.js';

const MESSAGE_ID = 'prefer-async-await';

function findReturnStatements(block) {
	const results = [];

	function walk(node) {
		if (!node) {
			return;
		}

		switch (node.type) {
			case 'ReturnStatement': {
				results.push(node);
				break;
			}

			case 'BlockStatement': {
				for (const statement of node.body) {
					walk(statement);
				}

				break;
			}

			case 'IfStatement': {
				walk(node.consequent);
				walk(node.alternate);
				break;
			}

			case 'SwitchStatement': {
				for (const switchCase of node.cases) {
					for (const statement of switchCase.consequent) {
						walk(statement);
					}
				}

				break;
			}

			case 'TryStatement': {
				walk(node.block);
				walk(node.handler?.body);
				walk(node.finalizer);
				break;
			}

			case 'ForStatement':
			case 'ForInStatement':
			case 'ForOfStatement':
			case 'WhileStatement':
			case 'DoWhileStatement':
			case 'LabeledStatement':
			case 'WithStatement': {
				walk(node.body);
				break;
			}

			// Don't descend into nested functions
			default: {
				break;
			}
		}
	}

	walk(block);

	return results;
}

function containsThen(node) {
	if (!node) {
		return false;
	}

	if (node.type === 'ChainExpression') {
		return containsThen(node.expression);
	}

	if (node.type !== 'CallExpression'
		|| node.callee.type !== 'MemberExpression'
	) {
		return false;
	}

	const {callee} = node;
	if (callee.property.type === 'Identifier'
		&& callee.property.name === 'then'
	) {
		return true;
	}

	return containsThen(callee.object);
}

const create = context => {
	const ava = createAvaRule(context.sourceCode);
	const {sourceCode} = context;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const implementationNode = util.getExecutableTestImplementation(node, sourceCode);

			if (!util.isFunctionExpression(implementationNode) || implementationNode.body.type !== 'BlockStatement') {
				return;
			}

			const returnStatements = findReturnStatements(implementationNode.body);

			if (returnStatements.length === 0) {
				return;
			}

			for (const returnStatement of returnStatements) {
				if (containsThen(returnStatement.argument)) {
					context.report({
						node: implementationNode,
						messageId: MESSAGE_ID,
					});
					return;
				}
			}

			// Check if any returned variable was assigned from a `.then()` call
			for (const returnStatement of returnStatements) {
				if (returnStatement.argument?.type !== 'Identifier') {
					continue;
				}

				const variable = findVariable(sourceCode.getScope(returnStatement), returnStatement.argument);
				if (!variable) {
					continue;
				}

				for (const definition of variable.defs) {
					if (definition.type !== 'Variable' || !containsThen(definition.node.init)) {
						continue;
					}

					context.report({
						node: implementationNode,
						messageId: MESSAGE_ID,
					});
					return;
				}
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Prefer async/await over returning a Promise.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Prefer using async/await instead of returning a Promise.',
		},
	},
};

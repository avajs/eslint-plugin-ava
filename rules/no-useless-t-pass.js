import {findVariable} from '@eslint-community/eslint-utils';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-useless-t-pass';

function getTestObjectVariable(node, sourceCode) {
	if (!util.isFunctionExpression(node)) {
		return undefined;
	}

	const [firstParameter] = node.params;
	if (
		firstParameter?.type !== 'Identifier'
		|| !util.isTestObject(firstParameter.name)
	) {
		return undefined;
	}

	return findVariable(sourceCode.getScope(firstParameter), firstParameter);
}

function getImplementationArgument(node) {
	for (const argument of node.arguments.slice(0, 2)) {
		const normalizedArgument = util.unwrapTypeExpression(argument);
		if (util.isFunctionExpression(normalizedArgument)) {
			return normalizedArgument;
		}
	}

	return undefined;
}

function isAllowedTryCall(node, sourceCode, allowedTestObjectVariables) {
	if (node.callee.type !== 'MemberExpression') {
		return false;
	}

	const firstNonSkipMember = util.getMembers(node.callee).find(name => name !== 'skip');
	if (firstNonSkipMember !== 'try') {
		return false;
	}

	const rootNode = util.getRootNode(node.callee).object;
	if (
		rootNode.type !== 'Identifier'
		|| !util.isTestObject(rootNode.name)
	) {
		return false;
	}

	const variable = findVariable(sourceCode.getScope(rootNode), rootNode);
	return !variable || allowedTestObjectVariables.has(variable);
}

function getAllowedTestObjectVariables(node, sourceCode, testNode) {
	const allowedTestObjectVariables = new Set();
	const testObjectVariable = getTestObjectVariable(getImplementationArgument(testNode), sourceCode);
	if (testObjectVariable) {
		allowedTestObjectVariables.add(testObjectVariable);
	}

	for (const ancestorNode of sourceCode.getAncestors(node)) {
		if (!util.isFunctionExpression(ancestorNode)) {
			continue;
		}

		const parentNode = ancestorNode.parent;
		if (
			parentNode?.type !== 'CallExpression'
			|| !parentNode.arguments.includes(ancestorNode)
			|| !isAllowedTryCall(parentNode, sourceCode, allowedTestObjectVariables)
		) {
			continue;
		}

		const tryTestObjectVariable = getTestObjectVariable(ancestorNode, sourceCode);
		if (tryTestObjectVariable) {
			allowedTestObjectVariables.add(tryTestObjectVariable);
		}
	}

	return allowedTestObjectVariables;
}

function getTestObjectKey(callee, sourceCode, allowedTestObjectVariables) {
	const rootNode = util.getRootNode(callee).object;
	if (
		rootNode.type !== 'Identifier'
		|| !util.isTestObject(rootNode.name)
	) {
		return undefined;
	}

	const variable = findVariable(sourceCode.getScope(rootNode), rootNode);
	if (!variable) {
		return rootNode.name;
	}

	if (!allowedTestObjectVariables.has(variable)) {
		return undefined;
	}

	return variable;
}

const create = context => {
	const ava = createAvaRule(context);
	const {sourceCode} = context;
	let hasPlanByTestObject = new Map();
	let passNodesByTestObject = new Map();

	return ava.merge({
		CallExpression(node) {
			if (!ava.isInTestFile()) {
				return;
			}

			const currentTestNode = ava.isInTestNode(node);
			if (!currentTestNode) {
				return;
			}

			const {callee} = node;
			if (
				callee.type !== 'MemberExpression'
				|| !callee.property
				|| util.isPropertyUnderContext(callee)
			) {
				return;
			}

			const allowedTestObjectVariables = getAllowedTestObjectVariables(node, sourceCode, currentTestNode);
			const testObjectKey = getTestObjectKey(callee, sourceCode, allowedTestObjectVariables);
			if (!testObjectKey) {
				return;
			}

			const firstNonSkipMember = util.getMembers(callee).find(name => name !== 'skip');
			if (firstNonSkipMember === 'plan') {
				hasPlanByTestObject.set(testObjectKey, true);
			} else if (firstNonSkipMember === 'pass') {
				const nodes = passNodesByTestObject.get(testObjectKey) ?? [];
				nodes.push(node);
				passNodesByTestObject.set(testObjectKey, nodes);
			}
		},
		'CallExpression:exit'(node) {
			if (!ava.isTestNode(node)) {
				return;
			}

			for (const [testObjectKey, passNodes] of passNodesByTestObject) {
				if (hasPlanByTestObject.get(testObjectKey)) {
					continue;
				}

				for (const node of passNodes) {
					context.report({
						node,
						messageId: MESSAGE_ID,
					});
				}
			}

			hasPlanByTestObject = new Map();
			passNodesByTestObject = new Map();
		},
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow useless `t.pass()`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: '`t.pass()` is useless without `t.plan()`.',
		},
	},
};

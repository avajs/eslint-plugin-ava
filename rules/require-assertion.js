import {visitIf} from 'enhance-visitors';
import {findVariable, getStaticValue} from '@eslint-community/eslint-utils';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'require-assertion';

function isStringTitleArgument(argument, sourceCode, node) {
	if (!argument) {
		return false;
	}

	if (
		argument.type === 'Literal'
		&& typeof argument.value === 'string'
	) {
		return true;
	}

	if (argument.type === 'TemplateLiteral') {
		return true;
	}

	const staticValue = getStaticValue(argument, sourceCode.getScope(node));
	return typeof staticValue?.value === 'string';
}

function isImplementationNode(node) {
	return util.isFunctionExpression(node) || node?.type === 'ObjectExpression';
}

function getReferenceIdentifier(node) {
	if (node?.type === 'Identifier') {
		return node;
	}

	if (node?.type === 'MemberExpression') {
		const rootNode = util.getRootNode(node).object;
		if (rootNode.type === 'Identifier') {
			return rootNode;
		}
	}

	return undefined;
}

function isKnownImplementationReference(node, sourceCode) {
	if (isImplementationNode(node)) {
		return true;
	}

	const referenceIdentifier = getReferenceIdentifier(node);
	if (!referenceIdentifier) {
		return false;
	}

	const variable = findVariable(sourceCode.getScope(referenceIdentifier), referenceIdentifier);
	if (!variable) {
		return false;
	}

	for (const definition of variable.defs) {
		if (
			definition.type === 'FunctionName'
			|| definition.type === 'ImportBinding'
		) {
			return true;
		}

		if (definition.type !== 'Variable') {
			continue;
		}

		const init = util.unwrapTypeExpression(definition.node.init);
		if (isImplementationNode(init)) {
			return true;
		}
	}

	return false;
}

function getImplementationArgument(node, sourceCode) {
	const [firstArgument, secondArgument] = node.arguments;
	const unwrappedFirstArgument = util.unwrapTypeExpression(firstArgument);
	const unwrappedSecondArgument = util.unwrapTypeExpression(secondArgument);

	if (!unwrappedFirstArgument) {
		return undefined;
	}

	if (!unwrappedSecondArgument) {
		return unwrappedFirstArgument;
	}

	if (isStringTitleArgument(unwrappedFirstArgument, sourceCode, node)) {
		return unwrappedSecondArgument;
	}

	if (
		util.isFunctionExpression(unwrappedSecondArgument)
		&& !isKnownImplementationReference(unwrappedFirstArgument, sourceCode)
	) {
		return unwrappedSecondArgument;
	}

	return unwrappedFirstArgument;
}

function getTestObjectVariable(implementationArgument, sourceCode) {
	if (!util.isFunctionExpression(implementationArgument)) {
		return undefined;
	}

	const [firstParameter] = implementationArgument.params;
	if (
		firstParameter?.type !== 'Identifier'
		|| !util.isTestObject(firstParameter.name)
	) {
		return undefined;
	}

	return findVariable(sourceCode.getScope(firstParameter), firstParameter);
}

function createTestState(node, sourceCode) {
	const implementationArgument = getImplementationArgument(node, sourceCode);
	return {
		hasExternalImplementation: Boolean(implementationArgument && !util.isFunctionExpression(implementationArgument)),
		testObjectVariable: getTestObjectVariable(implementationArgument, sourceCode),
	};
}

function isTestObjectArgument(argument, sourceCode, testObjectVariable) {
	const normalizedArgument = util.unwrapTypeExpression(argument);
	if (
		normalizedArgument?.type !== 'Identifier'
		|| !testObjectVariable
	) {
		return false;
	}

	const variable = findVariable(sourceCode.getScope(normalizedArgument), normalizedArgument);
	return variable === testObjectVariable;
}

const create = context => {
	const ava = createAvaRule();
	const {sourceCode} = context;
	let assertionCount = 0;
	let currentTestState;

	return ava.merge({
		CallExpression: visitIf([ava.isInTestFile, ava.isInTestNode])(node => {
			const isCurrentTestNode = ava.isTestNode(node);

			if (isCurrentTestNode) {
				currentTestState = createTestState(node, sourceCode);
			}

			// Macro and external test implementation references assert outside this node.
			if (isCurrentTestNode && currentTestState.hasExternalImplementation) {
				assertionCount++;
				return;
			}

			// Intentionally treat passing the current test object to any call as assertion-like.
			// This keeps helper patterns like `helper(t)` accepted, at the cost of known false negatives such as `console.log(t)`.
			if (node.arguments.some(argument => isTestObjectArgument(argument, sourceCode, currentTestState?.testObjectVariable))) {
				assertionCount++;
				return;
			}

			if (node.callee.type !== 'MemberExpression') {
				return;
			}

			const rootObject = util.getRootNode(node.callee).object;
			if (!isTestObjectArgument(rootObject, sourceCode, currentTestState?.testObjectVariable)) {
				return;
			}

			const methodName = util.getMembers(node.callee).find(name => name !== 'skip');
			if (util.assertionMethods.has(methodName) || methodName === 'plan') {
				assertionCount++;
			}
		}),
		'CallExpression:exit': visitIf([ava.isTestNode])(node => {
			if (ava.hasNoUtilityModifier() && !ava.hasTestModifier('todo') && assertionCount === 0) {
				context.report({
					node,
					messageId: MESSAGE_ID,
				});
			}

			currentTestState = undefined;
			assertionCount = 0;
		}),
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Require that tests contain at least one assertion.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Test is missing an assertion. Tests without assertions will always pass.',
		},
	},
};

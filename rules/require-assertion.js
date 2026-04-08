import {visitIf} from 'enhance-visitors';
import {findVariable} from '@eslint-community/eslint-utils';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'require-assertion';

function getImplementationArgument(node, sourceCode) {
	return util.getTestImplementationArgument(node, sourceCode);
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
	let implementationArgument = getImplementationArgument(node, sourceCode);
	implementationArgument = util.getMacroExec(implementationArgument) ?? implementationArgument;

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
	const ava = createAvaRule(context.sourceCode);
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

			const methodName = util.getAssertionMethod(node.callee);
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

import enhance from 'enhance-visitors';
import {getTestModifiers, unwrapTypeExpression} from './util.js';

export default () => {
	let isTestFile = false;
	let currentTestNode;
	const testIdentifiers = new Set();

	function isTestFunctionCall(node) {
		if (node.type === 'Identifier') {
			return testIdentifiers.has(node.name);
		}

		if (node.type === 'MemberExpression') {
			return isTestFunctionCall(node.object);
		}

		return false;
	}

	function getTestModifierNames(node) {
		return getTestModifiers(node).map(property => property.name);
	}

	/* eslint quote-props: [2, "as-needed"] */
	const predefinedRules = {
		ImportDeclaration(node) {
			if (node.source.value !== 'ava' || node.importKind === 'type') {
				return;
			}

			for (const specifier of node.specifiers) {
				if (specifier.importKind === 'type') {
					continue;
				}

				if (specifier.type === 'ImportDefaultSpecifier') {
					isTestFile = true;
					testIdentifiers.add(specifier.local.name);
				} else if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'serial') {
					isTestFile = true;
					testIdentifiers.add(specifier.local.name);
				}
			}
		},
		VariableDeclarator(node) {
			const init = unwrapTypeExpression(node.init);

			// Track re-assignment from a test identifier (e.g., `const test = anyTest as TestFn<Context>`)
			if (init?.type === 'Identifier' && testIdentifiers.has(init.name) && node.id.type === 'Identifier') {
				testIdentifiers.add(node.id.name);
			}
		},
		CallExpression(node) {
			if (isTestFunctionCall(node.callee)) {
				// Entering test function
				currentTestNode = node;
			}
		},
		'CallExpression:exit'(node) {
			if (currentTestNode === node) {
				// Leaving test function
				currentTestNode = undefined;
			}
		},
		'Program:exit'() {
			isTestFile = false;
			testIdentifiers.clear();
		},
	};

	return {
		hasTestModifier: module_ => getTestModifierNames(currentTestNode).includes(module_),
		hasNoUtilityModifier() {
			const modifiers = getTestModifierNames(currentTestNode);
			return !modifiers.includes('before')
				&& !modifiers.includes('beforeEach')
				&& !modifiers.includes('after')
				&& !modifiers.includes('afterEach')
				&& !modifiers.includes('macro');
		},
		isInTestFile: () => isTestFile,
		isInTestNode: () => currentTestNode,
		isTestNode: node => currentTestNode === node,
		merge: customHandlers => enhance.mergeVisitors([predefinedRules, customHandlers]),
	};
};

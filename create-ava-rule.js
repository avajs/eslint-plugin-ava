import {getTestModifiers, unwrapTypeExpression} from './util.js';

export default context => {
	let isTestFile = false;
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

	const getModifierNames = node => getTestModifiers(node).map(property => property.name);

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
		'Program:exit'() {
			isTestFile = false;
			testIdentifiers.clear();
		},
	};

	return {
		isInTestFile: () => isTestFile,
		isTestNode: node => node.type === 'CallExpression' && isTestFunctionCall(node.callee),
		isInTestNode(node) {
			if (node.type === 'CallExpression' && isTestFunctionCall(node.callee)) {
				return node;
			}

			const ancestors = context.sourceCode.getAncestors(node);
			for (let index = ancestors.length - 1; index >= 0; index--) {
				const ancestor = ancestors[index];
				if (ancestor.type === 'CallExpression' && isTestFunctionCall(ancestor.callee)) {
					return ancestor;
				}
			}

			return undefined;
		},
		hasTestModifier: (node, modifier) => getModifierNames(node).includes(modifier),
		hasNoUtilityModifier(node) {
			const modifiers = getModifierNames(node);
			return !modifiers.includes('before')
				&& !modifiers.includes('beforeEach')
				&& !modifiers.includes('after')
				&& !modifiers.includes('afterEach')
				&& !modifiers.includes('macro');
		},
		merge: customHandlers => ({
			...predefinedRules,
			...Object.fromEntries(Object.entries(customHandlers).map(([key, custom]) => {
				const predefined = predefinedRules[key];
				if (!predefined) {
					return [key, custom];
				}

				return [key, key.endsWith(':exit')
					? node => {
						custom(node);
						predefined(node);
					}
					: node => {
						predefined(node);
						custom(node);
					}];
			})),
		}),
	};
};

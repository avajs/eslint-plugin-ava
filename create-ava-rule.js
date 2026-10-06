/* eslint-disable eslint-plugin/prefer-object-rule, eslint-plugin/require-meta-docs-description, eslint-plugin/require-meta-docs-recommended, eslint-plugin/require-meta-schema, eslint-plugin/require-meta-type */
import {findVariable} from '@eslint-community/eslint-utils';
import {conditionalModifiers, hasComputedTestModifier, unwrapTypeExpression} from './util.js';

const trackedAliasModifiers = new Set([
	'after',
	'afterEach',
	'always',
	'before',
	'beforeEach',
	'failing',
	'macro',
	'only',
	'runIf',
	'serial',
	'skip',
	'skipIf',
	'todo',
]);

const mergeVisitors = (...visitors) => {
	const visitor = {};

	for (const customVisitor of visitors) {
		for (const [selector, customHandler] of Object.entries(customVisitor)) {
			const predefinedHandler = visitor[selector];
			if (!predefinedHandler) {
				visitor[selector] = customHandler;
				continue;
			}

			visitor[selector] = selector.endsWith(':exit')
				? node => {
					customHandler(node);
					predefinedHandler(node);
				}
				: node => {
					predefinedHandler(node);
					customHandler(node);
				};
		}
	}

	return visitor;
};

// Scope resolution is a pure function of the source code, but ESLint instantiates a rule
// (and thus `createAvaRule`) once per rule. Sharing the analysis caches per `sourceCode`
// means the expensive `findVariable`/scope work runs once for a file instead of once per rule.
const analysisCacheBySourceCode = new WeakMap();

const getAnalysisCache = sourceCode => {
	let cache = analysisCacheBySourceCode.get(sourceCode);
	if (!cache) {
		cache = {
			testBindings: new WeakMap(),
			trackedModifiersCache: new WeakMap(),
			testFunctionCallCache: new WeakMap(),
			testModifierNamesCache: new WeakMap(),
		};
		analysisCacheBySourceCode.set(sourceCode, cache);
	}

	return cache;
};

const createAvaRule = sourceCode => {
	let isTestFile = false;
	let currentTestNode;
	// These caches are shared across every rule linting the same file. Bindings are populated
	// at declaration sites (visited before their uses), so the shared state is deterministic.
	const {
		testBindings,
		trackedModifiersCache,
		testFunctionCallCache,
		testModifierNamesCache,
	} = getAnalysisCache(sourceCode);

	function getTrackedModifiersFromVariable(variable, node) {
		const currentReference = variable.references.find(reference => reference.identifier === node);
		const currentVariableScope = currentReference?.from.variableScope;
		const isReassignedBeforeUse = variable.references.some(reference => reference.isWrite()
			&& !reference.init
			&& reference.identifier.range[0] < node.range[0]
			&& reference.from.variableScope === currentVariableScope);
		if (isReassignedBeforeUse) {
			return undefined;
		}

		for (const definition of variable.defs) {
			const modifiers = testBindings.get(definition.name);
			if (modifiers !== undefined) {
				return modifiers;
			}
		}
	}

	function getTrackedModifiers(node) {
		if (node.type !== 'Identifier') {
			return undefined;
		}

		if (trackedModifiersCache.has(node)) {
			return trackedModifiersCache.get(node);
		}

		const variable = findVariable(sourceCode.getScope(node), node);
		const modifiers = variable
			? getTrackedModifiersFromVariable(variable, node)
			: testBindings.get(node);
		trackedModifiersCache.set(node, modifiers);
		return modifiers;
	}

	function trackTestBinding(binding, modifiers = []) {
		// Bindings, not names, preserve alias semantics without leaking across shadowed scopes.
		testBindings.set(binding, modifiers);
	}

	function isTestFunctionCall(node) {
		if (testFunctionCallCache.has(node)) {
			return testFunctionCallCache.get(node);
		}

		let isTestFunction = false;

		switch (node.type) {
			case 'Identifier': {
				isTestFunction = getTrackedModifiers(node) !== undefined;
				break;
			}

			case 'MemberExpression': {
				// `test.skipIf` is not a test function. Only its result is: `test.skipIf(condition)`.
				isTestFunction = !conditionalModifiers.has(node.property.name)
					&& isTestFunctionCall(unwrapTypeExpression(node.object));
				break;
			}

			case 'CallExpression': {
				isTestFunction = node.callee.type === 'MemberExpression'
					&& conditionalModifiers.has(node.callee.property.name)
					&& isTestFunctionCall(unwrapTypeExpression(node.callee.object));
				break;
			}

			default: {
				break;
			}
		}

		testFunctionCallCache.set(node, isTestFunction);
		return isTestFunction;
	}

	function getTestModifierNames(node) {
		if (testModifierNamesCache.has(node)) {
			return testModifierNamesCache.get(node);
		}

		let modifierNames = [];

		switch (node.type) {
			case 'CallExpression': {
				modifierNames = getTestModifierNames(node.callee);
				break;
			}

			case 'Identifier': {
				modifierNames = getTrackedModifiers(node) ?? [];
				break;
			}

			case 'MemberExpression': {
				modifierNames = [...getTestModifierNames(unwrapTypeExpression(node.object)), node.property.name];
				break;
			}

			default: {
				break;
			}
		}

		testModifierNamesCache.set(node, modifierNames);
		return modifierNames;
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
					trackTestBinding(specifier.local);
				} else if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'serial') {
					isTestFile = true;
					trackTestBinding(specifier.local, ['serial']);
				}
			}
		},
		VariableDeclarator(node) {
			const init = unwrapTypeExpression(node.init);

			// Track aliases of test identifiers:
			// - Re-assignment: `const test = anyTest as TestFn<Context>`
			// - Member access: `const serial = test.serial`
			// Mutable aliases are allowed, but later writes stop them from being treated as AVA bindings.
			if (
				init
				&& node.id.type === 'Identifier'
				&& isTestFunctionCall(init)
				&& !hasComputedTestModifier(init)
				&& getTestModifierNames(init).every(modifier => trackedAliasModifiers.has(modifier))
			) {
				trackTestBinding(node.id, getTestModifierNames(init));
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
		merge: customHandlers => mergeVisitors(predefinedRules, customHandlers),
	};
};

export const visitIf = predicates => visitor => node => {
	if (predicates.every(predicate => predicate(node))) {
		return visitor(node);
	}
};

export default createAvaRule;

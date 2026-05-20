import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {findVariable, getStaticValue} from '@eslint-community/eslint-utils';
import resolveFrom from 'resolve-from';

const require = createRequire(import.meta.url);

const avaConfigFiles = ['ava.config.js', 'ava.config.mjs'];

// Walk up from the file to find the directory where AVA is configured.
// In a monorepo, the nearest package.json may belong to a sub-package
// while AVA is configured at the monorepo root.
export const findProjectRoot = filename => {
	let directory = path.resolve(path.dirname(filename));
	const {root} = path.parse(directory);
	let nearestPackageDirectory;

	while (directory !== root) {
		if (avaConfigFiles.some(configFile => fs.existsSync(path.join(directory, configFile)))) {
			return directory;
		}

		const packageJsonPath = path.join(directory, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			nearestPackageDirectory ??= directory;

			try {
				const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
				if ('ava' in packageJson) {
					return directory;
				}
			} catch {} // eslint-disable-line @stylistic/curly-newline
		}

		if (fs.existsSync(path.join(directory, '.git'))) {
			break;
		}

		directory = path.dirname(directory);
	}

	return nearestPackageDirectory;
};

/* c8 ignore start -- requires a real project with AVA's eslint-plugin-helper installed */
const avaHelperCache = new Map();

export const loadAvaHelper = (filename, overrides) => {
	const rootDirectory = findProjectRoot(filename);
	if (!rootDirectory) {
		return undefined;
	}

	const cacheKey = rootDirectory + JSON.stringify(overrides);
	if (avaHelperCache.has(cacheKey)) {
		return avaHelperCache.get(cacheKey);
	}

	// Prevent unbounded growth in long-running processes (e.g. IDE integrations).
	if (avaHelperCache.size > 100) {
		avaHelperCache.clear();
	}

	const avaHelperPath = resolveFrom.silent(path.resolve(path.dirname(filename)), 'ava/eslint-plugin-helper')
		?? resolveFrom.silent(rootDirectory, 'ava/eslint-plugin-helper');
	if (!avaHelperPath) {
		return undefined;
	}

	const avaHelper = require(avaHelperPath);
	const result = avaHelper.load(rootDirectory, overrides);
	avaHelperCache.set(cacheKey, result);
	return result;
};
/* c8 ignore stop */

const functionExpressions = new Set([
	'FunctionExpression',
	'ArrowFunctionExpression',
]);

/** Get the outermost member expression in a chained access. */
export const getRootNode = node => {
	if (node.object.type === 'MemberExpression') {
		return getRootNode(node.object);
	}

	return node;
};

/** Get the identifier name at the root of a member-expression chain. */
export const getNameOfRootNodeObject = node => getRootNode(node).object.name;

// Match valid test execution object names: `t`, `tt`, `t_`, `t1`-`t9`
// These are used in `t.try()` callbacks when variable shadowing is disallowed.
const testObjectPattern = /^t[t_1-9]?$/v;
export const isTestObject = name => testObjectPattern.test(name);

/** Check whether a member-expression chain starts from `.context`. */
export const isPropertyUnderContext = node => getRootNode(node).property.name === 'context';

/** Check whether a node is a function expression AVA can execute directly. */
export const isFunctionExpression = node => node && functionExpressions.has(node.type);

/** Strip TypeScript wrapper nodes and return the wrapped expression. */
export const unwrapTypeExpression = node => {
	if (
		node?.type === 'TSAsExpression'
		|| node?.type === 'TSTypeAssertion'
		|| node?.type === 'TSSatisfiesExpression'
		|| node?.type === 'TSNonNullExpression'
	) {
		return unwrapTypeExpression(node.expression);
	}

	return node;
};

/** Walk past TypeScript wrapper parents and return the first real parent. */
export const unwrapParentTypeExpression = node => {
	let {parent} = node;

	while (
		parent?.type === 'TSAsExpression'
		|| parent?.type === 'TSTypeAssertion'
		|| parent?.type === 'TSSatisfiesExpression'
		|| parent?.type === 'TSNonNullExpression'
	) {
		parent = parent.parent;
	}

	return parent;
};

/** Get the `exec` implementation from an inline object macro. */
export const getMacroExec = node => {
	if (node?.type !== 'ObjectExpression') {
		return undefined;
	}

	const execProperty = node.properties.find(property => property.type === 'Property'
		&& !property.computed
		&& (
			(property.key.type === 'Identifier' && property.key.name === 'exec')
			|| (property.key.type === 'Literal' && property.key.value === 'exec')
		));

	return unwrapTypeExpression(execProperty?.value);
};

/** Check whether a node is an inline function or object-macro implementation. */
export const isImplementationNode = node => isFunctionExpression(node) || node?.type === 'ObjectExpression';

/** Get the root identifier that a possible implementation reference is based on. */
export function getReferenceIdentifier(node) {
	if (node?.type === 'Identifier') {
		return node;
	}

	if (node?.type === 'MemberExpression') {
		const rootNode = getRootNode(node).object;
		if (rootNode.type === 'Identifier') {
			return rootNode;
		}
	}
}

/** Check whether a node resolves to a known implementation reference in scope. */
export function isKnownImplementationReference(node, sourceCode, currentNode) {
	if (isImplementationNode(node)) {
		return true;
	}

	const referenceIdentifier = getReferenceIdentifier(node);
	if (!referenceIdentifier) {
		return false;
	}

	const scopeNode = currentNode ?? referenceIdentifier;
	const variable = findVariable(sourceCode.getScope(scopeNode), referenceIdentifier);
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

		const init = unwrapTypeExpression(definition.node.init);
		if (isImplementationNode(init)) {
			return true;
		}
	}

	return false;
}

/** Check whether a node resolves to a local implementation reference, excluding imports. */
export function isLocalImplementationReference(node, sourceCode, currentNode) {
	if (isImplementationNode(node)) {
		return true;
	}

	const referenceIdentifier = getReferenceIdentifier(node);
	if (!referenceIdentifier) {
		return false;
	}

	const scopeNode = currentNode ?? referenceIdentifier;
	const variable = findVariable(sourceCode.getScope(scopeNode), referenceIdentifier);
	if (!variable) {
		return false;
	}

	for (const definition of variable.defs) {
		if (definition.type === 'FunctionName') {
			return true;
		}

		if (definition.type !== 'Variable') {
			continue;
		}

		const init = unwrapTypeExpression(definition.node.init);
		if (isImplementationNode(init)) {
			return true;
		}
	}

	return false;
}

function isImportedReference(node, sourceCode, currentNode) {
	const referenceIdentifier = getReferenceIdentifier(node);
	if (!referenceIdentifier) {
		return false;
	}

	const scopeNode = currentNode ?? referenceIdentifier;
	const variable = findVariable(sourceCode.getScope(scopeNode), referenceIdentifier);
	if (!variable) {
		return false;
	}

	return variable.defs.some(definition => definition.type === 'ImportBinding');
}

function shouldUseSecondArgumentAsImplementation(firstArgument, secondArgument, sourceCode, node) {
	if (isStringTitleArgument(firstArgument, sourceCode, node)) {
		return true;
	}

	/*
	Shared boundary for ambiguous two-argument calls:
	- `test("title", implementation)` is supported.
	- `test(titleExpression, implementation)` is supported when the title expression does not already resolve to a local implementation.
	- Imported references are never treated as titles in this ambiguous shape.
	We intentionally prefer keeping imported macro calls correct over guessing that an import is a title expression, because syntax alone cannot distinguish those cases reliably.
	Imported-title inference in this ambiguous shape is intentionally unsupported here. If someone writes `test(importedTitle, implementation)`, rules using this helper may not treat the second argument as the implementation, and that is an accepted tradeoff.
	Do not "fix" that by treating imported references as titles again unless the boundary itself is changed. That tradeoff is deliberate.
	*/
	return (getMacroExec(secondArgument) || isFunctionExpression(secondArgument))
		&& !isLocalImplementationReference(firstArgument, sourceCode, node)
		&& !isImportedReference(firstArgument, sourceCode, node);
}

/** Check whether an argument can be statically treated as a string title. */
export function isStringTitleArgument(argument, sourceCode, node) {
	if (!argument) {
		return false;
	}

	if (typeof getStringValue(argument) === 'string') {
		return true;
	}

	const staticValue = getStaticValue(argument, sourceCode.getScope(node));
	return typeof staticValue?.value === 'string';
}

/** Get the raw implementation argument for a test call. */
export function getTestImplementationArgument(node, sourceCode) {
	const [firstArgument, secondArgument] = node.arguments;
	const unwrappedFirstArgument = unwrapTypeExpression(firstArgument);
	const unwrappedSecondArgument = unwrapTypeExpression(secondArgument);

	if (!unwrappedFirstArgument) {
		return undefined;
	}

	if (!unwrappedSecondArgument) {
		return unwrappedFirstArgument;
	}

	if (shouldUseSecondArgumentAsImplementation(unwrappedFirstArgument, unwrappedSecondArgument, sourceCode, node)) {
		return unwrappedSecondArgument;
	}

	return unwrappedFirstArgument;
}

/** Get the direct executable implementation for a test call, if it is inline. */
export function getExecutableTestImplementation(node, sourceCode) {
	const implementationArgument = getTestImplementationArgument(node, sourceCode);
	return getMacroExec(implementationArgument) ?? implementationArgument;
}

function getTestModifiers(node) {
	if (node.type === 'CallExpression') {
		return getTestModifiers(node.callee);
	}

	if (node.type === 'MemberExpression') {
		return [...getTestModifiers(node.object), node.property];
	}

	return [];
}

export {getTestModifiers};

/** Check whether a test call uses any computed modifier access. */
export const hasComputedTestModifier = node => getTestModifiers(node).some(property => !property.name);

const hookNames = new Set(['before', 'after', 'beforeEach', 'afterEach']);

/**
Get the resolved hook name for a test node (e.g., `'before'`, `'after.always'`), or `undefined` if the node is not a hook call.
*/
export const getHookName = node => {
	const modifiers = getTestModifiers(node).map(property => property.name);
	const hook = modifiers.find(name => hookNames.has(name));
	if (!hook) {
		return undefined;
	}

	return (hook === 'after' || hook === 'afterEach') && modifiers.includes('always')
		? `${hook}.always`
		: hook;
};

/** Find a specific modifier node in a test call chain. */
export const getTestModifier = (node, module_) => getTestModifiers(node).find(property => property.name === module_);

/** Build the autofix range and replacement for removing a test modifier. */
export const removeTestModifier = parameters => {
	const modifier = parameters.modifier.trim();
	const range = [...getTestModifier(parameters.node, modifier).range];
	const replacementRegExp = new RegExp(String.raw`\.|${modifier}`, 'gv');
	const source = parameters.context.sourceCode.getText();
	let dotPosition = range[0] - 1;
	while (source.charAt(dotPosition) !== '.') {
		dotPosition -= 1;
	}

	let snippet = source.slice(dotPosition, range[1]);
	snippet = snippet.replace(replacementRegExp, '');
	return [[dotPosition, range[1]], snippet];
};

const getMembers = node => {
	const {name} = node.property;

	if (node.object.type === 'MemberExpression') {
		return [...getMembers(node.object), name];
	}

	return [name];
};

export {getMembers};

/** Get the assertion method name from a test-object member-expression chain. */
export const getAssertionMethod = callee => {
	const [firstMember] = getMembers(callee);

	// AVA models `.skip` as a modifier on assertion methods, for example `t.is.skip()`.
	// Leading chains like `t.skip.is()` are not supported and should not be treated as assertions.
	if (firstMember === 'skip') {
		return undefined;
	}

	return firstMember;
};

// Like `getAssertionMethod`, but also validates that only `.skip` follows the assertion name.
// Returns `undefined` for malformed chains like `t.is.context()`.
export const getAssertionName = callee => {
	const members = getMembers(callee);
	const name = getAssertionMethod(callee);
	return (name && members.slice(1).every(member => member === 'skip')) ? name : undefined;
};

const repoUrl = 'https://github.com/avajs/eslint-plugin-ava';

const getDocumentationUrl = filename => {
	const ruleName = path.basename(filename, '.js');
	return `${repoUrl}/blob/main/docs/rules/${ruleName}.md`;
};

export const getDocsUrl = getDocumentationUrl;

const assertionMethodsNumberArguments = new Map([
	['assert', 1],
	['deepEqual', 2],
	['fail', 0],
	['false', 1],
	['falsy', 1],
	['ifError', 1],
	['is', 2],
	['like', 2],
	['not', 2],
	['notDeepEqual', 2],
	['notRegex', 2],
	['notThrows', 1],
	['notThrowsAsync', 1],
	['pass', 0],
	['regex', 2],
	['snapshot', 1],
	['throws', 1],
	['throwsAsync', 1],
	['true', 1],
	['truthy', 1],
	['try', 1],
]);

const assertionMethodNames = [...assertionMethodsNumberArguments.keys()];

export {assertionMethodsNumberArguments};
export const assertionMethods = new Set(assertionMethodNames);
export const executionMethods = new Set([...assertionMethodNames, 'end', 'plan', 'log', 'teardown', 'timeout']);

/** Check whether a node represents a primitive value for assertion heuristics. */
export function isPrimitive(node) {
	return (node.type === 'Literal' && !node.regex)
		|| (node.type === 'Identifier' && (node.name === 'undefined' || node.name === 'NaN' || node.name === 'Infinity'))
		|| node.type === 'TemplateLiteral'
		|| (node.type === 'UnaryExpression' && node.operator === 'void')
		|| (node.type === 'UnaryExpression' && node.operator === '-' && (
			(node.argument.type === 'Literal' && !node.argument.regex)
			|| (node.argument.type === 'Identifier' && (node.argument.name === 'Infinity' || node.argument.name === 'NaN'))
		));
}

/** Get a static string value from a literal or plain template literal. */
export const getStringValue = node => {
	if (node.type === 'Literal' && typeof node.value === 'string') {
		return node.value;
	}

	if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
		return node.quasis[0].value.cooked ?? undefined;
	}
};

// Default export as a mutable object to allow test mocking of loadAvaHelper.
export default {
	loadAvaHelper,
	getRootNode,
	getNameOfRootNodeObject,
	isTestObject,
	isPropertyUnderContext,
	isFunctionExpression,
	unwrapTypeExpression,
	unwrapParentTypeExpression,
	getMacroExec,
	isImplementationNode,
	getReferenceIdentifier,
	isKnownImplementationReference,
	isLocalImplementationReference,
	isStringTitleArgument,
	getTestImplementationArgument,
	getExecutableTestImplementation,
	getTestModifiers,
	hasComputedTestModifier,
	getHookName,
	getTestModifier,
	removeTestModifier,
	getMembers,
	getAssertionMethod,
	getAssertionName,
	getDocsUrl,
	assertionMethodsNumberArguments,
	assertionMethods,
	executionMethods,
	isPrimitive,
	getStringValue,
};

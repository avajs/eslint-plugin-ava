import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import resolveFrom from 'resolve-from';
import packageJson from './package.json' with {type: 'json'};

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
			} catch {}
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

export const getRootNode = node => {
	if (node.object.type === 'MemberExpression') {
		return getRootNode(node.object);
	}

	return node;
};

export const getNameOfRootNodeObject = node => getRootNode(node).object.name;

// Match valid test execution object names: `t`, `tt`, `t_`, `t1`-`t9`
// These are used in `t.try()` callbacks when variable shadowing is disallowed.
const testObjectPattern = /^t[t_1-9]?$/;
export const isTestObject = name => testObjectPattern.test(name);

export const isPropertyUnderContext = node => getRootNode(node).property.name === 'context';

export const isFunctionExpression = node => node && functionExpressions.has(node.type);

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

export const getTestModifier = (node, module_) => getTestModifiers(node).find(property => property.name === module_);

export const removeTestModifier = parameters => {
	const modifier = parameters.modifier.trim();
	const range = [...getTestModifier(parameters.node, modifier).range];
	const replacementRegExp = new RegExp(`\\.|${modifier}`, 'g');
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

const repoUrl = 'https://github.com/avajs/eslint-plugin-ava';

const getDocumentationUrl = (filename, commitHash = `v${packageJson.version}`) => {
	const ruleName = path.basename(filename, '.js');
	return `${repoUrl}/blob/${commitHash}/docs/rules/${ruleName}.md`;
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

// Default export as a mutable object to allow test mocking of loadAvaHelper.
export default {
	loadAvaHelper,
	getRootNode,
	getNameOfRootNodeObject,
	isTestObject,
	isPropertyUnderContext,
	isFunctionExpression,
	unwrapTypeExpression,
	getTestModifiers,
	getTestModifier,
	removeTestModifier,
	getMembers,
	getDocsUrl,
	assertionMethodsNumberArguments,
	assertionMethods,
	executionMethods,
};

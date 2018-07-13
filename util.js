'use strict';
const fs = require('fs');
const path = require('path');
const pkg = require('./package');
const esmRequire = require('esm')(module, {
	cjs: false,
	mode: 'all'
});

const functionExpressions = [
	'FunctionExpression',
	'ArrowFunctionExpression'
];

exports.nameOfRootObject = node => {
	if (node.object.type === 'MemberExpression') {
		return exports.nameOfRootObject(node.object);
	}

	return node.object.name;
};

exports.isInContext = node => {
	if (node.object.type === 'MemberExpression') {
		return exports.isInContext(node.object);
	}

	return node.property.name === 'context';
};

exports.getAvaConfig = packageFilepath => {
	const defaultResult = {};

	if (!packageFilepath) {
		return defaultResult;
	}

	try {
		const packageContent = JSON.parse(fs.readFileSync(packageFilepath, 'utf8'));

		if (packageContent && packageContent.ava) {
			return packageContent.ava;
		}

		const projectDir = path.dirname(packageFilepath);
		const avaConfig = esmRequire(path.join(projectDir, 'ava.config.js'));

		return typeof avaConfig.default === 'function'
			? avaConfig.default({projectDir})
			: avaConfig.default;
	} catch (_) {
		return defaultResult;
	}
};

exports.isFunctionExpression = node => node && functionExpressions.includes(node.type);

function getTestModifiers(node) {
	if (node.type === 'CallExpression') {
		return getTestModifiers(node.callee);
	}

	if (node.type === 'MemberExpression') {
		return getTestModifiers(node.object).concat(node.property);
	}

	return [];
}

exports.getTestModifiers = getTestModifiers;

exports.getTestModifier = (node, mod) => {
	return getTestModifiers(node).find(property => property.name === mod);
};

/**
 * Removes given test-modifier from the source surrounding the given node
 *
 * @param {string} params.modifier - Name of the modifier
 * @param {Node} params.node - ESTree-node as provided by ESLint
 * @param {Context} params.context - ESLint-context as provided
 *
 * @return {Array} Compound parameters to be used as arguments for `fix.replaceTextRange()`
 */
exports.removeTestModifier = params => {
	const modifier = params.modifier.trim();
	const range = exports.getTestModifier(params.node, modifier).range.slice();
	const replacementRegExp = new RegExp(`\\.|${modifier}`, 'g');
	const source = params.context.getSourceCode().getText();
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
		return getMembers(node.object).concat(name);
	}

	return [name];
};

exports.getMembers = getMembers;

const repoUrl = 'https://github.com/avajs/eslint-plugin-ava';
/**
 * Return the URL of the rule's documentation, either from parameter or the
 * requiring file's name.
 * @param  {String} ruleName The name of the rule to generate a URL for.
 * @return {String}          The URL of the rule's documentation.
 */
const getDocsUrl = (filename, commitHash) => {
	const ruleName = path.basename(filename, '.js');
	commitHash = commitHash || `v${pkg.version}`;
	return `${repoUrl}/blob/${commitHash}/docs/rules/${ruleName}.md`;
};
exports.getDocsUrl = getDocsUrl;

const assertionMethodsNumArguments = new Map([
	['deepEqual', 2],
	['fail', 0],
	['false', 1],
	['falsy', 1],
	['ifError', 1],
	['is', 2],
	['not', 2],
	['notDeepEqual', 2],
	['notThrows', 1],
	['pass', 0],
	['regex', 2],
	['notRegex', 2],
	['snapshot', 1],
	['throws', 1],
	['true', 1],
	['truthy', 1]
]);

const assertionMethodNames = [...assertionMethodsNumArguments.keys()];

exports.assertionMethodsNumArguments = assertionMethodsNumArguments;
exports.assertionMethods = new Set(assertionMethodNames);
exports.executionMethods = new Set(assertionMethodNames.concat(['end', 'plan', 'log']));

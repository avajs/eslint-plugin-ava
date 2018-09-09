'use strict';
const fs = require('fs');
const path = require('path');
const isPlainObject = require('is-plain-object');
const esmRequire = require('esm')(module, {
	cjs: false,
	force: true,
	mode: 'all'
});
const pkg = require('./package');

const functionExpressions = [
	'FunctionExpression',
	'ArrowFunctionExpression'
];

const defaultFiles = [
	'test.js',
	'test-*.js',
	'test/**/*.js',
	'**/__tests__/**/*.js',
	'**/*.test.js'
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

const NO_SUCH_FILE = Symbol('no ava.config.js file');
const MISSING_DEFAULT_EXPORT = Symbol('missing default export');

// Based on https://github.com/avajs/ava/blob/v1.0.0-beta.6/lib/load-config.js,
// except where AVA would exit with an exception, this function returns an empty
// config object.
exports.getAvaConfig = packageFilepath => {
	const defaultResult = {};

	if (!packageFilepath) {
		return defaultResult;
	}

	try {
		const {ava: packageConf = defaultResult} = JSON.parse(fs.readFileSync(packageFilepath, 'utf8'));

		const projectDir = path.dirname(packageFilepath);
		let fileConf;
		try {
			({default: fileConf = MISSING_DEFAULT_EXPORT} = esmRequire(path.join(projectDir, 'ava.config.js')));
		} catch (error) {
			if (error && error.code === 'MODULE_NOT_FOUND') {
				fileConf = NO_SUCH_FILE;
			} else {
				return defaultResult;
			}
		}

		if (fileConf === MISSING_DEFAULT_EXPORT) {
			return defaultResult;
		}

		if (fileConf === NO_SUCH_FILE) {
			return packageConf;
		}

		if (Object.keys(packageConf).length > 0) {
			return defaultResult;
		}

		if (typeof fileConf === 'function') {
			fileConf = fileConf({projectDir});
		}

		return !fileConf || typeof fileConf.then === 'function' || !isPlainObject(fileConf) ?
			defaultResult :
			fileConf;
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
	['notRegex', 2],
	['notThrows', 1],
	['notThrowsAsync', 1],
	['pass', 0],
	['regex', 2],
	['snapshot', 1],
	['throws', 1],
	['throwsAsync', 1],
	['true', 1],
	['truthy', 1]
]);

const assertionMethodNames = [...assertionMethodsNumArguments.keys()];

exports.assertionMethodsNumArguments = assertionMethodsNumArguments;
exports.defaultFiles = defaultFiles;
exports.assertionMethods = new Set(assertionMethodNames);
exports.executionMethods = new Set(assertionMethodNames.concat(['end', 'plan', 'log']));

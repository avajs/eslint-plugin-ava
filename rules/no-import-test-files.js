'use strict';
const path = require('path');
const arrify = require('arrify');
const pkgUp = require('pkg-up');
const multimatch = require('multimatch');
const util = require('../util');

const defaultFiles = [
	'test.js',
	'test-*.js',
	'test/**/*.js',
	'**/__tests__/**/*.js',
	'**/*.test.js'
];

function isTestFile(files, rootDir, sourceFile, importedFile) {
	const absoluteImportedPath = path.resolve(path.dirname(sourceFile), importedFile);
	const relativePath = path.relative(rootDir, absoluteImportedPath);

	console.log(sourceFile, importedFile, absoluteImportedPath, relativePath);

	return multimatch([relativePath], files).length === 1;
}

function getPackageInfo() {
	const packageFilePath = pkgUp.sync();

	return {
		rootDir: packageFilePath && path.dirname(packageFilePath),
		files: util.getAvaConfig(packageFilePath).files
	};
}

const create = context => {
	const filename = context.getFilename();

	if (filename === '<text>') {
		return {};
	}

	const packageInfo = getPackageInfo();
	const options = context.options[0] || {};
	const files = arrify(options.files || packageInfo.files || defaultFiles);

	if (!packageInfo.rootDir) {
		// Could not find a package.json folder
		return {};
	}

	return {
		ImportDeclaration: node => {
			const isImportingTestFile = isTestFile(files, packageInfo.rootDir, filename, node.source.value);

			if (isImportingTestFile) {
				context.report({
					node,
					message: `You are importing a test file`,
				});
			}
		},
		CallExpression: node => {
			if (node.callee.type !== 'Identifier' || node.callee.name !== 'require') {
				return;
			}

			if (!node.arguments[0] || node.arguments[0].type !== 'Literal') {
				return;
			}

			const isImportingTestFile = isTestFile(files, packageInfo.rootDir, filename, node.arguments[0].value);

			if (isImportingTestFile) {
				context.report({
					node,
					message: `You are importing a test file`,
				});
			}
		},
	};
};

const schema = [{
	type: 'object',
	properties: {
		files: {
			anyOf: [
				{type: 'array'},
				{type: 'string'}
			]
		}
	}
}];

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		schema
	}
};

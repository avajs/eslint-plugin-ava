'use strict';
const path = require('path');
const arrify = require('arrify');
const pkgUp = require('pkg-up');
const multimatch = require('multimatch');
const util = require('../util');

function isTestFile(files, rootDir, sourceFile, importedFile) {
	const absoluteImportedPath = path.resolve(path.dirname(sourceFile), importedFile);
	const relativePath = path.relative(rootDir, absoluteImportedPath);

	return multimatch([relativePath], files).length === 1;
}

function getProjectInfo() {
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

	const projectInfo = getProjectInfo();
	const options = context.options[0] || {};
	const files = arrify(options.files || projectInfo.files || util.defaultFiles);

	if (!projectInfo.rootDir) {
		// Could not find a package.json folder
		return {};
	}

	return {
		ImportDeclaration: node => {
			const isImportingTestFile = isTestFile(files, projectInfo.rootDir, filename, node.source.value);

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

			const isImportingTestFile = isTestFile(files, projectInfo.rootDir, filename, node.arguments[0].value);

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

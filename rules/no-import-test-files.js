'use strict';
const {resolve, relative, dirname} = require('path');
const arrify = require('arrify');
const {sync} = require('pkg-up');
const multimatch = require('multimatch');
const {getAvaConfig, defaultFiles, getDocsUrl} = require('../util');

function isTestFile(files, rootDir, sourceFile, importedFile) {
	const absoluteImportedPath = resolve(dirname(sourceFile), importedFile);
	const relativePath = relative(rootDir, absoluteImportedPath);

	const isNotResolved = (importedFile) => {
		let isResolved
		try {
			require.resolve(importedFile)
			isResolved = true
		} catch (error) {
			isResolved = false
		}
		return !isResolved
	}

	return multimatch([relativePath], files).length === 1 && isNotResolved(importedFile)
}

function getProjectInfo() {
	const packageFilePath = sync();

	return {
		rootDir: packageFilePath && dirname(packageFilePath),
		files: getAvaConfig(packageFilePath).files
	};
}

function createImportValidator(context, files, projectInfo, filename) {
	return (node, importPath) => {
		const isImportingTestFile = isTestFile(files, projectInfo.rootDir, filename, importPath);

		if (isImportingTestFile) {
			context.report({
				node,
				message: 'Test files should not be imported'
			});
		}
	};
}

const create = context => {
	const filename = context.getFilename();

	if (filename === '<text>') {
		return {};
	}

	const projectInfo = getProjectInfo();
	const options = context.options[0] || {};
	const files = arrify(options.files || projectInfo.files || defaultFiles);

	if (!projectInfo.rootDir) {
		// Could not find a package.json folder
		return {};
	}

	const validateImportPath = createImportValidator(context, files, projectInfo, filename);

	return {
		ImportDeclaration: node => {
			validateImportPath(node, node.source.value);
		},
		CallExpression: node => {
			if (!(node.callee.type === 'Identifier' && node.callee.name === 'require')) {
				return;
			}

			if (node.arguments[0] && node.arguments[0].type === 'Literal') {
				validateImportPath(node, node.arguments[0].value);
			}
		}
	};
};

const schema = [{
	type: 'object',
	properties: {
		files: {
			type: 'array'
		}
	}
}];

module.exports = {
	create,
	meta: {
		docs: {
			url: getDocsUrl(__filename)
		},
		schema
	}
};

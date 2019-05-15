'use strict';
const path = require('path');
const arrify = require('arrify');
const pkgUp = require('pkg-up');
const multimatch = require('multimatch');
const util = require('../util');

const externalModuleRegExp = /^\w/;
function isExternalModule(name) {
	return externalModuleRegExp.test(name);
}

function isTestFile(files, extensions, rootDir, sourceFile, importedFile) {
	const absoluteImportedPath = path.resolve(path.dirname(sourceFile), importedFile);
	const relativePath = path.relative(rootDir, absoluteImportedPath);

	return multimatch([relativePath], files).filter(file => {
		const extension = path.extname(file).slice(1);
		return extensions.includes(extension);
	}).length === 1;
}

function getProjectInfo() {
	const packageFilePath = pkgUp.sync();
	const {files, babel} = util.getAvaConfig(packageFilePath);

	return {
		rootDir: packageFilePath && path.dirname(packageFilePath),
		files,
		babel
	};
}

function createImportValidator(context, files, extensions, projectInfo, filename) {
	return (node, importPath) => {
		const isImportingExternalModule = isExternalModule(importPath);
		if (isImportingExternalModule) {
			return;
		}

		const isImportingTestFile = isTestFile(files, extensions, projectInfo.rootDir, filename, importPath);
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

	const extensions = arrify(options.extensions || (projectInfo.babel && projectInfo.babel.extensions) || util.defaultExtensions);

	const files = arrify(options.files || projectInfo.files || util.defaultFiles);

	if (!projectInfo.rootDir) {
		// Could not find a package.json folder
		return {};
	}

	const validateImportPath = createImportValidator(context, files, extensions, projectInfo, filename);

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
			url: util.getDocsUrl(__filename)
		},
		schema
	}
};

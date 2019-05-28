'use strict';
const path = require('path');
const util = require('../util');

const externalModuleRegExp = /^\w/;
function isExternalModule(name) {
	return externalModuleRegExp.test(name);
}

const create = context => {
	const filename = context.getFilename();

	if (filename === '<text>') {
		return {};
	}

	const resolveFrom = path.dirname(filename);

	let loadedAvaHelper = false;
	let avaHelper;

	const validateImportPath = (node, importPath) => {
		if (!importPath || typeof importPath !== 'string') {
			return;
		}

		const isImportingExternalModule = isExternalModule(importPath);
		if (isImportingExternalModule) {
			return;
		}

		if (!loadedAvaHelper) {
			avaHelper = util.loadAvaHelper(filename);
			loadedAvaHelper = true;
		}

		if (!avaHelper) {
			return {};
		}

		const {isTest} = avaHelper.classifyImport(path.resolve(resolveFrom, importPath));
		if (isTest) {
			context.report({
				node,
				message: 'Test files should not be imported.'
			});
		}
	};

	return {
		ImportDeclaration: node => {
			validateImportPath(node, node.source.value);
		},
		CallExpression: node => {
			if (!(node.callee.type === 'Identifier' && node.callee.name === 'require')) {
				return;
			}

			if (node.arguments[0]) {
				validateImportPath(node, node.arguments[0].value);
			}
		}
	};
};

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		type: 'suggestion'
	}
};

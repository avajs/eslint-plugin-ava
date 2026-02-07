import fs from 'node:fs';
import path from 'node:path';
import util from '../util.js';

const MESSAGE_ID = 'no-import-test-files';

// Assume absolute paths can be classified by AVA.
const isFileImport = name => path.isAbsolute(name) || name.startsWith('./') || name.startsWith('../');

const create = context => {
	const {filename} = context;
	const [overrides] = context.options;

	if (filename === '<input>' || filename === '<text>') {
		return {};
	}

	const resolveFrom = path.dirname(filename);

	let loadedAvaHelper = false;
	let avaHelper;

	const validateImportPath = (node, importPath) => {
		if (!importPath || typeof importPath !== 'string') {
			return;
		}

		if (!isFileImport(importPath)) {
			return;
		}

		if (!loadedAvaHelper) {
			avaHelper = util.loadAvaHelper(filename, overrides);
			loadedAvaHelper = true;
		}

		if (!avaHelper) {
			return {};
		}

		let resolvedPath = path.resolve(resolveFrom, importPath);
		try {
			if (fs.statSync(resolvedPath).isDirectory()) {
				resolvedPath = path.join(resolvedPath, 'index');
			}
		} catch {}

		const {isTest} = avaHelper.classifyImport(resolvedPath);
		if (isTest) {
			context.report({
				node,
				messageId: MESSAGE_ID,
			});
		}
	};

	return {
		ImportDeclaration(node) {
			validateImportPath(node, node.source.value);
		},
		CallExpression(node) {
			if (!(node.callee.type === 'Identifier' && node.callee.name === 'require')) {
				return;
			}

			if (node.arguments[0]) {
				validateImportPath(node, node.arguments[0].value);
			}
		},
	};
};

const schema = [{
	type: 'object',
	properties: {
		extensions: {
			description: 'File extensions recognized as test files.',
			type: 'array',
		},
		files: {
			description: 'Glob patterns to match test files.',
			type: 'array',
		},
	},
	additionalProperties: false,
}];

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow importing test files.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema,
		defaultOptions: [{}],
		messages: {
			[MESSAGE_ID]: 'Test files should not be imported.',
		},
	},
};

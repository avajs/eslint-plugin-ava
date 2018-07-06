'use strict';
const espurify = require('espurify');
const deepStrictEqual = require('deep-strict-equal');
const util = require('../util');

const avaVariableDeclaratorInitAst = {
	type: 'CallExpression',
	callee: {
		type: 'Identifier',
		name: 'require'
	},
	arguments: [
		{
			type: 'Literal',
			value: 'ava'
		}
	]
};

function report(context, node) {
	context.report({
		node,
		message: 'AVA should be imported as `test`.'
	});
}

const create = context => ({
	ImportDeclaration: node => {
		if (node.source.value === 'ava') {
			const defaultImport = node.specifiers.find(({type}) => type === 'ImportDefaultSpecifier');
			if (defaultImport && defaultImport.local.name !== 'test') {
				report(context, node);
			}
			const namedImports = node.specifiers.filter(({type}) => type === 'ImportSpecifier');
			const testNamedImport = namedImports.find(({imported}) => imported.name === 'test');

			if (testNamedImport) {
				context.report({
					node,
					message: 'AVA test can not be imported by name. Use default import.',
					fix: (fixer) => {
						if (!defaultImport || defaultImport.local.name === 'test') {
							if (namedImports.length === 1) {
								return fixer.replaceText(node, "import test from 'ava';")
							} else {
								const namedImportsStr = namedImports.filter(i => i !== testNamedImport).map(i =>
									i.imported.name !== i.local.name
										? `${i.imported.name} as ${i.local.name}`
										: i.imported.name
								).join(', ');

								return fixer.replaceText(node, `import test, {${namedImportsStr}} from 'ava';`)
							}
						}
					}
				});
			}
		}
	},
	VariableDeclarator: node => {
		if (node.id.name !== 'test' && node.init && deepStrictEqual(espurify(node.init), avaVariableDeclaratorInitAst)) {
			report(context, node);
		}
	}
});

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		fixable: 'code'
	}
};

'use strict';

const path = require('node:path');
const {isDeepStrictEqual} = require('node:util');
const espurify = require('espurify');
const util = require('../util');

const avaVariableDeclaratorInitAst = {
	type: 'CallExpression',
	callee: {
		type: 'Identifier',
		name: 'require',
	},
	arguments: [
		{
			type: 'Literal',
			value: 'ava',
		},
	],
};

function report(context, node) {
	context.report({
		node,
		message: 'AVA should be imported as `test`.',
	});
}

const create = context => {
	const extension = path.extname(context.getFilename());
	const isTypeScript = extension === '.ts' || extension === '.tsx';

	return {
		'ImportDeclaration[importKind!="type"]'(node) {
			if (node.source.value === 'ava') {
				const {name} = node.specifiers[0].local;
				if (name !== 'test' && (!isTypeScript || name !== 'anyTest')) {
					report(context, node);
				}
			}
		},
		VariableDeclarator(node) {
			if (node.init && isDeepStrictEqual(espurify(node.init), avaVariableDeclaratorInitAst)) {
				const {name} = node.id;
				if (name !== 'test' && (!isTypeScript || name !== 'anyTest')) {
					report(context, node);
				}
			}
		},
	};
};

module.exports = {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Ensure that AVA is imported with `test` as the variable name.',
			url: util.getDocsUrl(__filename),
		},
		schema: [],
	},
};

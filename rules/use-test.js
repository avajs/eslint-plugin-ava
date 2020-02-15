'use strict';
const path = require('path');
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

const create = context => {
	const isTypescript = ['.ts', '.tsx'].includes(path.extname(context.getFilename()));

	return {
		ImportDeclaration: node => {
			if (node.source.value === 'ava' &&
				!['test', ...(isTypescript ? ['anyTest'] : [])].includes(node.specifiers[0].local.name)) {
				report(context, node);
			}
		},
		VariableDeclarator: node => {
			if (!['test', ...(isTypescript ? ['anyTest'] : [])].includes(node.id.name) &&
				node.init && deepStrictEqual(espurify(node.init), avaVariableDeclaratorInitAst)) {
				report(context, node);
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

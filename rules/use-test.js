import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import espurify from 'espurify';
import util from '../util.js';

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
	const extension = path.extname(context.filename);
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

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Ensure that AVA is imported with `test` as the variable name.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
	},
};

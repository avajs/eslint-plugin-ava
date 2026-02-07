import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import espurify from 'espurify';
import util from '../util.js';

const MESSAGE_ID = 'use-test';

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
		messageId: MESSAGE_ID,
	});
}

const create = context => {
	const extension = path.extname(context.filename);
	const isTypeScript = ['.ts', '.tsx', '.mts', '.cts'].includes(extension);

	return {
		'ImportDeclaration[importKind!="type"]'(node) {
			if (node.source.value === 'ava') {
				// Skip inline type imports: `import {type Foo} from 'ava'`
				if (node.specifiers.every(specifier => specifier.importKind === 'type')) {
					return;
				}

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
			description: 'Require AVA to be imported as `test`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'AVA should be imported as `test`.',
		},
	},
};

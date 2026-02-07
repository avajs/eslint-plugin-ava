import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

function containsThen(node) {
	if (!node
		|| node.type !== 'CallExpression'
		|| node.callee.type !== 'MemberExpression'
	) {
		return false;
	}

	const {callee} = node;
	if (callee.property.type === 'Identifier'
		&& callee.property.name === 'then'
	) {
		return true;
	}

	return containsThen(callee.object);
}

const create = context => {
	const ava = createAvaRule();

	const check = visitIf([
		ava.isInTestFile,
		ava.isInTestNode,
	])(node => {
		if (node.body.type !== 'BlockStatement') {
			return;
		}

		const statements = node.body.body;
		const returnStatement = statements.find(statement => statement.type === 'ReturnStatement');
		if (returnStatement && containsThen(returnStatement.argument)) {
			context.report({
				node,
				message: 'Prefer using async/await instead of returning a Promise.',
			});
		}
	});

	return ava.merge({
		ArrowFunctionExpression: check,
		FunctionExpression: check,
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Prefer using async/await instead of returning a Promise.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
	},
};

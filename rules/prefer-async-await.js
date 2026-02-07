import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'prefer-async-await';

function containsThen(node) {
	if (!node) {
		return false;
	}

	if (node.type === 'ChainExpression') {
		return containsThen(node.expression);
	}

	if (node.type !== 'CallExpression'
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

		if (!returnStatement) {
			return;
		}

		if (containsThen(returnStatement.argument)) {
			context.report({
				node,
				messageId: MESSAGE_ID,
			});
			return;
		}

		// Check if the returned variable was assigned from a `.then()` call
		if (returnStatement.argument?.type === 'Identifier') {
			const returnedName = returnStatement.argument.name;

			for (const statement of statements) {
				if (statement.type !== 'VariableDeclaration') {
					continue;
				}

				for (const declarator of statement.declarations) {
					if (
						declarator.id.type === 'Identifier'
						&& declarator.id.name === returnedName
						&& containsThen(declarator.init)
					) {
						context.report({
							node,
							messageId: MESSAGE_ID,
						});
						return;
					}
				}
			}
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
			description: 'Prefer async/await over returning a Promise.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Prefer using async/await instead of returning a Promise.',
		},
	},
};

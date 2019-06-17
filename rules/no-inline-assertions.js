'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

function report({node, context}) {
	context.report({
		node,
		message: 'Assertions should not be called from an inline function.'
	});
}

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			const functionArgIndex = node.arguments.length - 1;
			if (functionArgIndex > 1) {
				return;
			}

			const functionArg = node.arguments[functionArgIndex];

			if (!util.isFunctionExpression(functionArg)) {
				return;
			}

			const {body} = functionArg;
			if (body.type === 'CallExpression') {
				report({node, context});
				return;
			}

			if (body.type === 'BlockStatement') {
				if (body.loc.start.line !== body.loc.end.line) {
					return;
				}

				if (body.body.length === 0) {
					return;
				}

				report({node, context});
			}
		})
	});
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

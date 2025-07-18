'use strict';

const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();

	let titleRegExp;
	if (context.options[0]?.format) {
		titleRegExp = new RegExp(context.options[0].format);
	} else {
		return {};
	}

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
			ava.hasNoUtilityModifier,
		])(node => {
			const requiredLength = ava.hasTestModifier('todo') ? 1 : 2;
			const hasTitle = node.arguments.length >= requiredLength;

			if (hasTitle) {
				const title = node.arguments[0];
				if (title.type === 'Literal' && !titleRegExp.test(title.value)) {
					context.report({
						node,
						message: `The test title doesn't match the required format: \`${titleRegExp}\`.`,
					});
				}
			}
		}),
	});
};

const schema = [
	{
		type: 'object',
		properties: {
			format: {
				type: 'string',
				default: undefined,
			},
		},
		additionalProperties: false,
	},
];

module.exports = {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Ensure test titles have a certain format.',
			url: util.getDocsUrl(__filename),
		},
		schema,
	},
};

'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();
	let titleRegExp;
	try {
		if (context.options[0] && context.options[0].format) {
			titleRegExp = new RegExp(context.options[0].format);
		}
	} catch (error) {
		context.report({
			loc: {
				start: {
					line: 1,
					column: 0
				}
			},
			message: `${error.message} in rule configuration.`
		});
	}

	if (!titleRegExp) {
		return {};
	}

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
			ava.hasNoHookModifier
		])(node => {
			const requiredLength = ava.hasTestModifier('todo') ? 1 : 2;
			const hasTitle = node.arguments.length >= requiredLength;

			if (hasTitle) {
				const title = node.arguments[0];
				if (title.type === 'Literal' && !titleRegExp.test(title.value)) {
					context.report({
						node,
						message: `The test title doesn't match the required format: ${titleRegExp}`
					});
				}
			}
		})
	});
};

module.exports = {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			url: util.getDocsUrl(__filename)
		}
	}
};

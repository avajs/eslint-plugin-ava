'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			const propertyNode = util.getTestModifier(node, 'only');
			if (propertyNode) {
				context.report({
					node: propertyNode,
					message: '`test.only()` should not be used.',
					fix: fixer => {
						const range = propertyNode.range.slice();
						const source = context.getSourceCode().getText();
						let dotPosition = range[0] - 1;
						while (source.charAt(dotPosition) !== '.') {
							dotPosition -= 1;
						}
						let snippet = source.substring(dotPosition, range[1]);
						snippet = snippet.replace(/\.|only/g, '');
						return fixer.replaceTextRange([dotPosition, range[1]], snippet);
					}
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {
		fixable: 'code'
	}
};

'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');

const getTestModifier = function (node, mod) {
	if (node.type === 'CallExpression') {
		return getTestModifier(node.callee, mod);
	} else if (node.type === 'MemberExpression') {
		if (node.property.type === 'Identifier' && node.property.name === mod) {
			return node.property;
		}

		return getTestModifier(node.object, mod);
	}

	return undefined;
};

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			if (ava.hasTestModifier('only')) {
				context.report({
					node,
					message: '`test.only()` should not be used.',
					fix: fixer => {
						const range = getTestModifier(node, 'only').range;
						range[0] -= 1;
						return fixer.remove(getTestModifier(node, 'only'));
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

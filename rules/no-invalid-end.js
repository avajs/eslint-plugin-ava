'use strict';
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		MemberExpression: ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(node => {
			if (node.property.name === 'end' &&
					!ava.hasTestModifier('cb') &&
					util.nameOfRootObject(node) === 't') {
				context.report({
					node,
					message: '`t.end()` should only be used inside of `test.cb()`.'
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {
		docs: {}
	}
};

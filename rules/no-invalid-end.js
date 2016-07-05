'use strict';
const visitIf = require('enhance-visitors').visitIf;
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

module.exports = context => {
	const ava = createAvaRule();

	return ava.merge({
		MemberExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
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

'use strict';
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

module.exports = context => {
	const ava = createAvaRule();

	return ava.merge({
		MemberExpression: ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(node => {
			if (node.property.name === 'skip' &&
					util.nameOfRootObject(node) === 't') {
				context.report({
					node,
					message: 'No assertions should be skipped.'
				});
			}
		})
	});
};

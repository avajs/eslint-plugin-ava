'use strict';
const createAvaRule = require('../create-ava-rule');

const create = context => {
	const ava = createAvaRule();
	let endCalled = false;

	return ava.merge({
		'MemberExpression': ava.if(
			ava.isInTestFile,
			ava.isInTestNode
		)(node => {
			if (ava.hasTestModifier('cb') &&
				node.object.name === 't' &&
				node.property.name === 'end'
			) {
				endCalled = true;
			}
		}),
		'CallExpression:exit': ava.if(
			ava.isInTestFile,
			ava.isTestNode
		)(node => {
			if (!ava.hasTestModifier('cb')) {
				return;
			}

			// leaving test function
			if (endCalled) {
				endCalled = false;
			} else {
				context.report({
					node,
					message: 'Callback test was not ended. Make sure to explicitly end the test with `t.end()`.'
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {}
};

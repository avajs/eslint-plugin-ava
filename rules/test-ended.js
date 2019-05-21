'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();
	const hasCbModifier = () => ava.hasTestModifier('cb');
	let endCalled = false;

	return ava.merge({
		MemberExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
			hasCbModifier
		])(node => {
			if (node.object.name === 't' &&
				node.property.name === 'end'
			) {
				endCalled = true;
			}
		}),
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
			hasCbModifier
		])(node => {
			const firstArg = node.arguments[0];
			if (node.callee.property.name === 'cb' && firstArg.type === 'Identifier') {
				const scope = context.getScope();
				const exists = scope.references.some(ref => ref.identifier.name === firstArg.name);
				if (exists) {
					endCalled = true;
				}
			}
		}),
		'CallExpression:exit': visitIf([
			ava.isInTestFile,
			ava.isTestNode,
			hasCbModifier
		])(node => {
			// Leaving test function
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
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		type: 'problem'
	}
};

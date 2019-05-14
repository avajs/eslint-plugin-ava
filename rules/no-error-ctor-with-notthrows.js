'use strict';
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const errorNameRegex = /^(?:[A-Z][a-z\d]*)*Error$/;

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			const functionArgIndex = node.arguments.length - 1;

			if (typeof node.callee.property === 'undefined') {
				return;
			}

			const calleeProperty = node.callee.property.name;

			if (functionArgIndex !== 1) {
				return;
			}

			const functionArgName = node.arguments[1].name;

			if (calleeProperty === 'notThrows' || calleeProperty === 'notThrowsAsync') {
				if (errorNameRegex.test(functionArgName)) {
					context.report({
						node,
						message: 'Do not specify an error constructor in the second argument of t.notThrows()'
					});
				}
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

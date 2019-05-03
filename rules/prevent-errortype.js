'use strict';
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const nameRegexp = /^(?:[A-Z][a-z0-9]*)*Error$/;

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			const functionArgIndex = node.arguments.length - 1;
			let functionArgName;

			if (typeof node.callee.property === 'undefined') {
				return;
			}

			const calleeProperty = node.callee.property.name;

			if (functionArgIndex === 1) {
				functionArgName = node.arguments[1].name;
			} else {
				return;
			}

			if (calleeProperty === 'notThrows') {
				if (nameRegexp.test(functionArgName)) {
					context.report({
						node,
						message: 'Do not specify Error in t.notThrows()'
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
		}
	}
};

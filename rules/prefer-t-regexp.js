'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const create = context => {
	const ava = createAvaRule();

	const booleanTests = [
		'true',
		'false',
		'truthy',
		'falsy',
	];

	const findReference = name => {
		const reference = context.getScope().references.find(ref => ref.identifier.name === name);
		const definitions = reference.resolved.defs;
		return definitions[definitions.length - 1].node;
	};

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			// Call a boolean assertion (eg: true, false ...)
			if (node.callee.type === 'MemberExpression' &&
				booleanTests.includes(node.callee.property.name) &&
				util.nameOfRootObject(node.callee) === 't') {
				const called = node.arguments[0];

				// Call the `test` function
				if (called.type === 'CallExpression' && called.callee.property.name === 'test') {
					let isRegExp = called.callee.object.regex;

					// It's not a regexp but an identifier
					if (!isRegExp && called.callee.object.type === 'Identifier') {
						const reference = findReference(called.callee.object.name);
						isRegExp = reference.init.regex;
					}
					if (isRegExp) {
						context.report({
							node,
							message: 'Prefer using the `regexp` assert function.'
						});
					}
				}
			}
		})
	});
};

const schema = [{
}];

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		schema
	}
};

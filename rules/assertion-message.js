'use strict';
const visitIf = require('enhance-visitors').visitIf;
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const expectedNbArguments = {
	deepEqual: 2,
	fail: 0,
	false: 1,
	falsy: 1,
	ifError: 1,
	is: 2,
	not: 2,
	notDeepEqual: 2,
	notThrows: 1,
	pass: 0,
	regex: 2,
	notRegex: 2,
	throws: 1,
	true: 1,
	truthy: 1
};

function nbArguments(node) {
	const nArgs = expectedNbArguments[node.property.name];

	if (nArgs !== undefined) {
		return nArgs;
	}

	if (node.object.type === 'MemberExpression') {
		return nbArguments(node.object);
	}

	return -1;
}

const create = context => {
	const ava = createAvaRule();
	const shouldHaveMessage = context.options[0] !== 'never';

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			const callee = node.callee;

			if (callee.type !== 'MemberExpression') {
				return;
			}

			if (callee.property && util.nameOfRootObject(callee) === 't') {
				const nArgs = nbArguments(callee);

				if (nArgs === -1) {
					return;
				}

				const hasMessage = nArgs < node.arguments.length;

				if (!hasMessage && shouldHaveMessage) {
					context.report({
						node,
						message: 'Expected an assertion message, but found none.'
					});
				} else if (hasMessage && !shouldHaveMessage) {
					context.report({
						node,
						message: 'Expected no assertion message, but found one.'
					});
				}
			}
		})
	});
};

const schema = [{
	enum: [
		'always',
		'never'
	]
}];

module.exports = {
	create,
	meta: {
		schema
	}
};

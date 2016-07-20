'use strict';
const visitIf = require('enhance-visitors').visitIf;
const createAvaRule = require('../create-ava-rule');

const modifiers = [
	'after',
	'afterEach',
	'always',
	'before',
	'beforeEach',
	'cb',
	'only',
	'serial',
	'skip',
	'todo',
	'failing'
];

function getTestModifiers(node) {
	if (node.type === 'CallExpression') {
		return getTestModifiers(node.callee);
	}

	if (node.type === 'MemberExpression') {
		return getTestModifiers(node.object).concat(node.property.name);
	}

	return [];
}

const unknownModifiers = node => getTestModifiers(node)
	.filter(modifier => modifiers.indexOf(modifier) === -1);

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			const unknown = unknownModifiers(node);

			if (unknown.length !== 0) {
				context.report({
					node,
					message: `Unknown test modifier \`${unknown[0]}\`.`
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {}
};

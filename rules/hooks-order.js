'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const MESSAGE_ID = 'hooks-order';

const create = context => {
	const ava = createAvaRule();

	let before = null;
	let after = null;
	let beforeEach = null;
	let afterEach = null;
	let test = null;

	return ava.merge({
		'CallExpression[callee.object.name="test"][callee.property.name="before"]': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			before = node.callee.property.name;

			const invalidNode = after || beforeEach || afterEach || test;

			if (invalidNode) {
				context.report({
					node,
					messageId: MESSAGE_ID,
					data: {
						current: before,
						invalid: invalidNode
					}
				});
			}
		}),
		'CallExpression[callee.object.name="test"][callee.property.name="after"]': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			after = node.callee.property.name;

			const invalidNode = beforeEach || afterEach || test;

			if (invalidNode) {
				context.report({
					node,
					messageId: MESSAGE_ID,
					data: {
						current: after,
						invalid: invalidNode
					}
				});
			}
		}),
		'CallExpression[callee.object.name="test"][callee.property.name="beforeEach"]': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			beforeEach = node.callee.property.name;

			const invalidNode = afterEach || test;

			if (invalidNode) {
				context.report({
					node,
					messageId: MESSAGE_ID,
					data: {
						current: beforeEach,
						invalid: invalidNode
					}
				});
			}
		}),
		'CallExpression[callee.object.name="test"][callee.property.name="afterEach"]': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			afterEach = node.callee.property.name;

			const invalidName = test;

			if (invalidName) {
				context.report({
					node,
					messageId: MESSAGE_ID,
					data: {
						current: afterEach,
						invalid: invalidName
					}
				});
			}
		}),
		'CallExpression[callee.name="test"]': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			test = node.callee.name;
		})
	});
};

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		messages: {
			[MESSAGE_ID]: '`{{current}}` hook must come before `{{invalid}}`'
		},
		type: 'suggestion'
	}
};

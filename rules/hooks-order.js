'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const MESSAGE_ID = 'hooks-order';

const create = context => {
	const ava = createAvaRule();

	let before;
	let after;
	let afterAlways;
	let beforeEach;
	let afterEach;
	let afterEachAlways;
	let test;

	return ava.merge({
		'CallExpression[callee.object.name="test"][callee.property.name="before"]': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			before = node.callee.property.name;

			const invalidNode = after || afterAlways || beforeEach || afterEach || afterEachAlways || test;

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

			const invalidNode = afterAlways || beforeEach || afterEach || afterEachAlways || test;

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
		'CallExpression[callee.object.object.name="test"][callee.object.property.name="after"][callee.property.name="always"]': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			afterAlways = 'after.always';

			const invalidName = beforeEach || afterEach || afterEachAlways || test;

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
		'CallExpression[callee.object.name="test"][callee.property.name="beforeEach"]': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			beforeEach = node.callee.property.name;

			const invalidNode = afterEach || afterEachAlways || test;

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

			const invalidName = afterEachAlways || test;

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
		'CallExpression[callee.object.object.name="test"][callee.object.property.name="afterEach"][callee.property.name="always"]': visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			afterEachAlways = 'afterEach.always';

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

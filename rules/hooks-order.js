'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const MESSAGE_ID = 'hooks-order';

const buildOrders = names => {
	const orders = {};
	for (const nameNext of names) {
		for (const namePrev in orders) {
			if (orders[namePrev]) {
				orders[namePrev].push(nameNext);
			}
		}

		orders[nameNext] = [];
	}

	return orders;
};

const buildMessage = (name, orders, visited) => {
	const checks = orders[name] || [];

	for (const check of checks) {
		const invalidNode = visited[check];
		if (invalidNode) {
			return {
				messageId: MESSAGE_ID,
				data: {
					current: name,
					invalid: check
				}
			};
		}
	}

	return null;
};

const create = context => {
	const ava = createAvaRule();

	const orders = buildOrders([
		'before',
		'after',
		'after.always',
		'beforeEach',
		'afterEach',
		'afterEach.always',
		'test'
	]);

	const visited = {};

	const checks = [
		{
			selector: 'CallExpression[callee.object.name="test"][callee.property.name="before"]',
			name: 'before'
		},
		{
			selector: 'CallExpression[callee.object.name="test"][callee.property.name="after"]',
			name: 'after'
		},
		{
			selector: 'CallExpression[callee.object.object.name="test"][callee.object.property.name="after"][callee.property.name="always"]',
			name: 'after.always'
		},
		{
			selector: 'CallExpression[callee.object.name="test"][callee.property.name="beforeEach"]',
			name: 'beforeEach'
		},
		{
			selector: 'CallExpression[callee.object.name="test"][callee.property.name="afterEach"]',
			name: 'afterEach'
		},
		{
			selector: 'CallExpression[callee.object.object.name="test"][callee.object.property.name="afterEach"][callee.property.name="always"]',
			name: 'afterEach.always'
		},
		{
			selector: 'CallExpression[callee.name="test"]',
			name: 'test'
		}
	];

	const selectors = checks.reduce((result, check) => {
		result[check.selector] = visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			visited[check.name] = true;

			const message = buildMessage(check.name, orders, visited);
			if (message) {
				context.report({
					node,
					...message
				});
			}
		});
		return result;
	}, {});

	return ava.merge(selectors);
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

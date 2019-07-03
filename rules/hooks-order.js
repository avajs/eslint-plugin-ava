'use strict';
const {visitIf} = require('enhance-visitors');
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

const MESSAGE_ID = 'hooks-order';

const buildOrders = names => {
	const orders = {};
	for (const nameLater of names) {
		for (const nameEarlier in orders) {
			if (orders[nameEarlier]) {
				orders[nameEarlier].push(nameLater);
			}
		}

		orders[nameLater] = [];
	}

	return orders;
};

const buildMessage = (name, orders, visited) => {
	const checks = orders[name] || [];

	for (const check of checks) {
		const nodeEarlier = visited[check];
		if (nodeEarlier) {
			return {
				messageId: MESSAGE_ID,
				data: {
					current: name,
					invalid: check
				},
				node: nodeEarlier
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

	const sourceCode = context.getSourceCode();

	const selectors = checks.reduce((result, check) => {
		result[check.selector] = visitIf([
			ava.isInTestFile,
			ava.isTestNode
		])(node => {
			visited[check.name] = node;

			const message = buildMessage(check.name, orders, visited);
			if (message) {
				const nodeEarlier = message.node;

				context.report({
					node,
					messageId: message.messageId,
					data: message.data,
					fix: fixer => {
						const tokensBetween = sourceCode.getTokensBetween(nodeEarlier.parent, node.parent);

						if (tokensBetween && tokensBetween.length > 0) {
							return;
						}

						const source = sourceCode.getText();
						let [insertStart, insertEnd] = nodeEarlier.parent.range;

						// Grab the node and all comments and whitespace before the node
						const start = nodeEarlier.parent.range[1];
						const end = node.parent.range[1];

						let text = sourceCode.getText().substring(start, end);

						// Preserve newline previously between hooks
						if (source.length >= (start + 1) && source[start + 1] === '\n') {
							text = text.substring(1) + '\n';
						}

						// Preserve newline that was previously before hooks
						if ((insertStart - 1) > 0 && source[insertStart - 1] === '\n') {
							insertStart -= 1;
						}

						return [
							fixer.insertTextBeforeRange([insertStart, insertEnd], text),
							fixer.removeRange([start, end])
						];
					}
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
		type: 'suggestion',
		fixable: 'code'
	}
};

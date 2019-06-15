'use strict';
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const MESSAGE_ID_LITERAL = 'no-deep-equal-with-literal';
const MESSAGE_ID_TEMPLATE = 'no-deep-equal-with-template';
const MESSAGE_ID_UNDEFINED = 'no-deep-equal-with-undefined';

const fixIs = (fixer, node) => {
	return fixer.replaceText(node.callee.property, 'is');
};

const fixNot = (fixer, node) => {
	return fixer.replaceText(node.callee.property, 'not');
};

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		'CallExpression[callee.property.name="deepEqual"][arguments.1.type="Literal"]': visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			context.report({
				node,
				messageId: MESSAGE_ID_LITERAL,
				data: {
					callee: node.callee.property.name
				},
				fix: fixer => fixIs(fixer, node)
			});
		}),
		'CallExpression[callee.property.name="deepEqual"][arguments.1.type="Identifier"][arguments.1.name="undefined"]': visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			context.report({
				node,
				messageId: MESSAGE_ID_UNDEFINED,
				data: {
					callee: node.callee.property.name
				},
				fix: fixer => fixIs(fixer, node)
			});
		}),
		'CallExpression[callee.property.name="deepEqual"][arguments.1.type="TemplateLiteral"]': visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			context.report({
				node,
				messageId: MESSAGE_ID_TEMPLATE,
				data: {
					callee: node.callee.property.name
				},
				fix: fixer => fixIs(fixer, node)
			});
		}),
		'CallExpression[callee.property.name="notDeepEqual"][arguments.1.type="Literal"]': visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			context.report({
				node,
				messageId: MESSAGE_ID_LITERAL,
				data: {
					callee: node.callee.property.name
				},
				fix: fixer => fixNot(fixer, node)
			});
		}),
		'CallExpression[callee.property.name="notDeepEqual"][arguments.1.type="Identifier"][arguments.1.name="undefined"]': visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			context.report({
				node,
				messageId: MESSAGE_ID_UNDEFINED,
				data: {
					callee: node.callee.property.name
				},
				fix: fixer => fixNot(fixer, node)
			});
		}),
		'CallExpression[callee.property.name="notDeepEqual"][arguments.1.type="TemplateLiteral"]': visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			context.report({
				node,
				messageId: MESSAGE_ID_TEMPLATE,
				data: {
					callee: node.callee.property.name
				},
				fix: fixer => fixNot(fixer, node)
			});
		})
	});
};

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		fixable: true,
		messages: {
			[MESSAGE_ID_LITERAL]: 'Avoid using `{{callee}}` with literals',
			[MESSAGE_ID_TEMPLATE]: 'Avoid using `{{callee}}` with templates',
			[MESSAGE_ID_UNDEFINED]: 'Avoid using `{{callee}}` with `undefined`'
		},
		type: 'suggestion'
	}
};

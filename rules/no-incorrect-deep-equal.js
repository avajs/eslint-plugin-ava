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

	const callExpression = 'CallExpression';
	const deepEqual = '[callee.property.name="deepEqual"]';
	const notDeepEqual = '[callee.property.name="notDeepEqual"]';

	const argumentsLiteral = ':matches([arguments.0.type="Literal"],[arguments.1.type="Literal"])';
	const argumentsUndefined = ':matches([arguments.0.type="Identifier"][arguments.0.name="undefined"],[arguments.1.type="Identifier"][arguments.1.name="undefined"])';
	const argumentsTemplate = ':matches([arguments.0.type="TemplateLiteral"],[arguments.1.type="TemplateLiteral"])';

	return ava.merge({
		[`${callExpression}${deepEqual}${argumentsLiteral}`]: visitIf([
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
		[`${callExpression}${deepEqual}${argumentsUndefined}`]: visitIf([
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
		[`${callExpression}${deepEqual}${argumentsTemplate}`]: visitIf([
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
		[`${callExpression}${notDeepEqual}${argumentsLiteral}`]: visitIf([
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
		[`${callExpression}${notDeepEqual}${argumentsUndefined}`]: visitIf([
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
		[`${callExpression}${notDeepEqual}${argumentsTemplate}`]: visitIf([
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

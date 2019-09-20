'use strict';
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const MESSAGE_ID = 'no-deep-equal-with-primative';

const buildDeepEqualMessage = (context, node) => {
	context.report({
		node,
		messageId: MESSAGE_ID,
		data: {
			callee: node.callee.property.name
		},
		fix: fixer => fixer.replaceText(node.callee.property, 'is')
	});
};

const buildNotDeepEqualMessage = (context, node) => {
	context.report({
		node,
		messageId: MESSAGE_ID,
		data: {
			callee: node.callee.property.name
		},
		fix: fixer => fixer.replaceText(node.callee.property, 'not')
	});
};

const create = context => {
	const ava = createAvaRule();

	const callExpression = 'CallExpression';
	const deepEqual = '[callee.property.name="deepEqual"]';
	const notDeepEqual = '[callee.property.name="notDeepEqual"]';

	const argumentsLiteral = ':matches([arguments.0.type="Literal"][arguments.0.regex="undefined"],[arguments.1.type="Literal"][arguments.1.regex="undefined"])';
	const argumentsUndefined = ':matches([arguments.0.type="Identifier"][arguments.0.name="undefined"],[arguments.1.type="Identifier"][arguments.1.name="undefined"])';
	const argumentsTemplate = ':matches([arguments.0.type="TemplateLiteral"],[arguments.1.type="TemplateLiteral"])';

	return ava.merge({
		[`${callExpression}${deepEqual}${argumentsLiteral}`]: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			buildDeepEqualMessage(context, node);
		}),
		[`${callExpression}${deepEqual}${argumentsUndefined}`]: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			buildDeepEqualMessage(context, node);
		}),
		[`${callExpression}${deepEqual}${argumentsTemplate}`]: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			buildDeepEqualMessage(context, node);
		}),
		[`${callExpression}${notDeepEqual}${argumentsLiteral}`]: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			buildNotDeepEqualMessage(context, node);
		}),
		[`${callExpression}${notDeepEqual}${argumentsUndefined}`]: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			buildNotDeepEqualMessage(context, node);
		}),
		[`${callExpression}${notDeepEqual}${argumentsTemplate}`]: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			buildNotDeepEqualMessage(context, node);
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
			[MESSAGE_ID]: 'Avoid using `{{callee}}` with literal primitives'
		},
		type: 'suggestion'
	}
};

import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-deep-equal-with-primitive';

const buildDeepEqualMessage = (context, node) => {
	context.report({
		node,
		messageId: MESSAGE_ID,
		data: {
			callee: node.callee.property.name,
		},
		fix: fixer => fixer.replaceText(node.callee.property, 'is'),
	});
};

const buildNotDeepEqualMessage = (context, node) => {
	context.report({
		node,
		messageId: MESSAGE_ID,
		data: {
			callee: node.callee.property.name,
		},
		fix: fixer => fixer.replaceText(node.callee.property, 'not'),
	});
};

const create = context => {
	const ava = createAvaRule(context);

	const callExpression = 'CallExpression';
	const deepEqual = '[callee.property.name="deepEqual"]';
	const notDeepEqual = '[callee.property.name="notDeepEqual"]';

	const argumentsLiteral = ':matches([arguments.0.type="Literal"][arguments.0.regex="undefined"],[arguments.1.type="Literal"][arguments.1.regex="undefined"])';
	const argumentsUndefined = ':matches([arguments.0.type="Identifier"][arguments.0.name="undefined"],[arguments.1.type="Identifier"][arguments.1.name="undefined"])';
	const argumentsTemplate = ':matches([arguments.0.type="TemplateLiteral"],[arguments.1.type="TemplateLiteral"])';

	return ava.merge({
		[`${callExpression}${deepEqual}${argumentsLiteral}`](node) {
			if (!ava.isInTestFile() || !ava.isInTestNode(node)) {
				return;
			}

			buildDeepEqualMessage(context, node);
		},
		[`${callExpression}${deepEqual}${argumentsUndefined}`](node) {
			if (!ava.isInTestFile() || !ava.isInTestNode(node)) {
				return;
			}

			buildDeepEqualMessage(context, node);
		},
		[`${callExpression}${deepEqual}${argumentsTemplate}`](node) {
			if (!ava.isInTestFile() || !ava.isInTestNode(node)) {
				return;
			}

			buildDeepEqualMessage(context, node);
		},
		[`${callExpression}${notDeepEqual}${argumentsLiteral}`](node) {
			if (!ava.isInTestFile() || !ava.isInTestNode(node)) {
				return;
			}

			buildNotDeepEqualMessage(context, node);
		},
		[`${callExpression}${notDeepEqual}${argumentsUndefined}`](node) {
			if (!ava.isInTestFile() || !ava.isInTestNode(node)) {
				return;
			}

			buildNotDeepEqualMessage(context, node);
		},
		[`${callExpression}${notDeepEqual}${argumentsTemplate}`](node) {
			if (!ava.isInTestFile() || !ava.isInTestNode(node)) {
				return;
			}

			buildNotDeepEqualMessage(context, node);
		},
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow using `deepEqual` with primitives.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Avoid using `{{callee}}` with literal primitives',
		},
	},
};

import {isDeepStrictEqual} from 'node:util';
import espurify from 'espurify';
import createAvaRule, {visitIf} from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-identical-title';

const purify = node => node && espurify(node);

const isStaticTemplateLiteral = node => node.expressions.every(expression => isStatic(expression));

const isStatic = node => node.type === 'Literal'
	|| (node.type === 'TemplateLiteral' && isStaticTemplateLiteral(node))
	|| (node.type === 'BinaryExpression' && isStatic(node.left) && isStatic(node.right));

function isTitleUsed(usedTitleKeys, key) {
	if (typeof key === 'string') {
		return usedTitleKeys.includes(key);
	}

	return usedTitleKeys.some(usedKey => typeof usedKey !== 'string' && isDeepStrictEqual(key, usedKey));
}

function hasObjectMacroTitle(node) {
	return node?.type === 'ObjectExpression' && node.properties.some(property => property.type === 'Property'
		&& !property.computed
		&& (
			(property.key.type === 'Identifier' && property.key.name === 'title')
			|| (property.key.type === 'Literal' && property.key.value === 'title')
		));
}

const create = context => {
	const ava = createAvaRule(context.sourceCode);
	let usedTitleKeys = [];

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
			ava.hasNoUtilityModifier,
		])(node => {
			const arguments_ = node.arguments;
			const titleNode = arguments_.length > 1 || ava.hasTestModifier('todo') ? arguments_[0] : undefined;

			// Don't flag computed titles
			if (!titleNode || !isStatic(titleNode)) {
				return;
			}

			// Data-driven object macros with their own `title()` can compute the final title from runtime arguments.
			if (arguments_.length > 2 && util.getMacroExec(arguments_[1]) && hasObjectMacroTitle(arguments_[1])) {
				return;
			}

			// Don't flag what look to be macros with data arguments,
			// but still flag inline function implementations.
			if (arguments_.length > 2 && !util.isFunctionExpression(arguments_[1]) && !util.getMacroExec(arguments_[1])) {
				return;
			}

			const key = util.getStringValue(titleNode) ?? purify(titleNode);

			if (isTitleUsed(usedTitleKeys, key)) {
				context.report({
					node: titleNode,
					messageId: MESSAGE_ID,
				});
				return;
			}

			usedTitleKeys.push(key);
		}),
		'Program:exit'() {
			usedTitleKeys = [];
		},
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow identical test titles.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Test title is used multiple times in the same file.',
		},
	},
};

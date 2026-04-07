import {isDeepStrictEqual} from 'node:util';
import espurify from 'espurify';
import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-identical-title';

const purify = node => node && espurify(node);

const getStringValue = node => {
	if (node.type === 'Literal' && typeof node.value === 'string') {
		return node.value;
	}

	if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
		return node.quasis[0].value.cooked;
	}
};

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

const create = context => {
	const ava = createAvaRule();
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

			// Don't flag what look to be macros
			if (arguments_.length > 2 && !util.isFunctionExpression(arguments_[1])) {
				return;
			}

			const key = getStringValue(titleNode) ?? purify(titleNode);

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

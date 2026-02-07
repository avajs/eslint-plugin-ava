import {isDeepStrictEqual} from 'node:util';
import espurify from 'espurify';
import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-identical-title';

const purify = node => node && espurify(node);

const isStaticTemplateLiteral = node => node.expressions.every(expression => isStatic(expression));

const isStatic = node => node.type === 'Literal'
	|| (node.type === 'TemplateLiteral' && isStaticTemplateLiteral(node))
	|| (node.type === 'BinaryExpression' && isStatic(node.left) && isStatic(node.right));

function isTitleUsed(usedTitleNodes, titleNode) {
	const purifiedNode = purify(titleNode);
	return usedTitleNodes.some(usedTitle => isDeepStrictEqual(purifiedNode, usedTitle));
}

const create = context => {
	const ava = createAvaRule();
	let usedTitleNodes = [];

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

			if (isTitleUsed(usedTitleNodes, titleNode)) {
				context.report({
					node: titleNode,
					messageId: MESSAGE_ID,
				});
				return;
			}

			usedTitleNodes.push(purify(titleNode));
		}),
		'Program:exit'() {
			usedTitleNodes = [];
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

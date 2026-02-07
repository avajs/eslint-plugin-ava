import {visitIf} from 'enhance-visitors';
import MicroSpellingCorrecter from 'micro-spelling-correcter';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID_NOT_FUNCTION = 'not-function';
const MESSAGE_ID_UNKNOWN_ASSERTION = 'unknown-assertion';
const MESSAGE_ID_UNKNOWN_MEMBER = 'unknown-member';
const MESSAGE_ID_MISSPELLED = 'misspelled';
const MESSAGE_ID_CHAINING = 'chaining';
const MESSAGE_ID_MISSING_ASSERTION = 'missing-assertion';
const MESSAGE_ID_TOO_MANY_SKIPS = 'too-many-skips';
const MESSAGE_ID_SKIP_POSITION = 'skip-position';

const properties = new Set([
	...util.executionMethods,
	'context',
	'title',
	'skip',
]);

const correcter = new MicroSpellingCorrecter([...properties]);

const isCallExpression = node =>
	node.parent.type === 'CallExpression'
	&& node.parent.callee === node;

const getMemberNodes = node => {
	if (node.object.type === 'MemberExpression') {
		return [...getMemberNodes(node.object), node.property];
	}

	return [node.property];
};

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (node.callee.type !== 'MemberExpression'
				&& node.callee.name === 't') {
				context.report({
					node,
					messageId: MESSAGE_ID_NOT_FUNCTION,
				});
			}
		}),
		MemberExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (node.parent.type === 'MemberExpression'
				|| util.getNameOfRootNodeObject(node) !== 't') {
				return;
			}

			const members = getMemberNodes(node);

			const skipPositions = [];
			let hadCall = false;
			for (const [i, member] of members.entries()) {
				const {name} = member;

				let corrected = correcter.correct(name);

				if (i !== 0 && (corrected === 'context' || corrected === 'title')) { // `context` and `title` can only be first
					corrected = undefined;
				}

				if (corrected !== name) {
					if (corrected === undefined) {
						if (isCallExpression(node)) {
							context.report({
								node,
								messageId: MESSAGE_ID_UNKNOWN_ASSERTION,
								data: {name},
							});
						} else {
							context.report({
								node,
								messageId: MESSAGE_ID_UNKNOWN_MEMBER,
								data: {name},
							});
						}
					} else {
						context.report({
							node,
							messageId: MESSAGE_ID_MISSPELLED,
							data: {corrected, name},
							fix: fixer => fixer.replaceText(member, corrected),
						});
					}

					return; // Don't check further
				}

				if (name === 'context' || name === 'title') {
					if (members.length === 1 && isCallExpression(node)) {
						context.report({
							node,
							messageId: MESSAGE_ID_UNKNOWN_ASSERTION,
							data: {name},
						});
					}

					return; // Don't check further
				}

				if (name === 'skip') {
					skipPositions.push(i);
				} else {
					if (hadCall) {
						context.report({
							node,
							messageId: MESSAGE_ID_CHAINING,
						});
					}

					hadCall = true;
				}
			}

			if (!hadCall) {
				context.report({
					node,
					messageId: MESSAGE_ID_MISSING_ASSERTION,
				});
			}

			if (skipPositions.length > 1) {
				context.report({
					node,
					messageId: MESSAGE_ID_TOO_MANY_SKIPS,
					fix(fixer) {
						const chain = ['t', ...members.map(member => member.name).filter(name => name !== 'skip'), 'skip'];
						return fixer.replaceText(node, chain.join('.'));
					},
				});
			}

			if (skipPositions.length === 1 && skipPositions[0] !== members.length - 1) {
				context.report({
					node,
					messageId: MESSAGE_ID_SKIP_POSITION,
					fix(fixer) {
						const chain = ['t', ...members.map(member => member.name).filter(name => name !== 'skip'), 'skip'];
						return fixer.replaceText(node, chain.join('.'));
					},
				});
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow incorrect use of `t`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID_NOT_FUNCTION]: '`t` is not a function.',
			[MESSAGE_ID_UNKNOWN_ASSERTION]: 'Unknown assertion method `.{{name}}`.',
			[MESSAGE_ID_UNKNOWN_MEMBER]: 'Unknown member `.{{name}}`. Use `.context.{{name}}` instead.',
			[MESSAGE_ID_MISSPELLED]: 'Misspelled `.{{corrected}}` as `.{{name}}`.',
			[MESSAGE_ID_CHAINING]: 'Can\'t chain assertion methods.',
			[MESSAGE_ID_MISSING_ASSERTION]: 'Missing assertion method.',
			[MESSAGE_ID_TOO_MANY_SKIPS]: 'Too many chained uses of `.skip`.',
			[MESSAGE_ID_SKIP_POSITION]: '`.skip` modifier should be the last in chain.',
		},
	},
};

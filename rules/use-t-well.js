'use strict';
const {visitIf} = require('enhance-visitors');
const MicroSpellingCorrecter = require('micro-spelling-correcter');

const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const properties = new Set([
	...util.executionMethods,
	'context',
	'title',
	'skip'
]);

const correcter = new MicroSpellingCorrecter([...properties]);

const isCallExpression = node =>
	node.parent.type === 'CallExpression' &&
	node.parent.callee === node;

const getMemberNodes = node => {
	if (node.object.type === 'MemberExpression') {
		return getMemberNodes(node.object).concat(node.property);
	}

	return [node.property];
};

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			if (node.callee.type !== 'MemberExpression' &&
					node.callee.name === 't') {
				context.report({
					node,
					message: '`t` is not a function.'
				});
			}
		}),
		MemberExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			if (node.parent.type === 'MemberExpression' ||
					util.getNameOfRootNodeObject(node) !== 't') {
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
								message: `Unknown assertion method \`.${name}\`.`
							});
						} else {
							context.report({
								node,
								message: `Unknown member \`.${name}\`. Use \`.context.${name}\` instead.`
							});
						}
					} else {
						context.report({
							node,
							message: `Misspelled \`.${corrected}\` as \`.${name}\`.`,
							fix: fixer => fixer.replaceText(member, corrected)
						});
					}

					return; // Don't check further
				}

				if (name === 'context' || name === 'title') {
					if (members.length === 1 && isCallExpression(node)) {
						context.report({
							node,
							message: `Unknown assertion method \`.${name}\`.`
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
							message: 'Can\'t chain assertion methods.'
						});
					}

					hadCall = true;
				}
			}

			if (!hadCall) {
				context.report({
					node,
					message: 'Missing assertion method.'
				});
			}

			if (skipPositions.length > 1) {
				context.report({
					node,
					message: 'Too many chained uses of `.skip`.',
					fix: fixer => {
						const chain = ['t', ...members.map(member => member.name).filter(name => name !== 'skip'), 'skip'];
						return fixer.replaceText(node, chain.join('.'));
					}
				});
			}

			if (skipPositions.length === 1 && skipPositions[0] !== members.length - 1) {
				context.report({
					node,
					message: '`.skip` modifier should be the last in chain.',
					fix: fixer => {
						const chain = ['t', ...members.map(member => member.name).filter(name => name !== 'skip'), 'skip'];
						return fixer.replaceText(node, chain.join('.'));
					}
				});
			}
		})
	});
};

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		fixable: 'code',
		type: 'problem'
	}
};

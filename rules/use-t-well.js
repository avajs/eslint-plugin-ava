'use strict';
const {visitIf} = require('enhance-visitors');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

class MicroCorrecter {
	constructor(words) {
		this.words = new Set(words);

		const letters = new Set();
		words.forEach(word => word.split('').forEach(letter => letters.add(letter)));
		this.letters = [...letters];
	}

	edits(word) {
		const edits = [];
		const {length} = word;
		const {letters} = this;

		for (let i = 0; i < length; i++) {
			edits.push(word.slice(0, i) + word.slice(i + 1)); // Skip
			for (const letter of letters) {
				edits.push(word.slice(0, i) + letter + word.slice(i + 1)); // Replace
			}
		}

		for (let i = 1; i < length; i++) {
			edits.push(word.slice(0, i - 1) + word[i] + word[i - 1] + word.slice(i + 1)); // Transposition
		}

		for (let i = 0; i <= length; i++) {
			for (const letter of letters) {
				edits.push(word.slice(0, i) + letter + word.slice(i)); // Addition
			}
		}

		return edits;
	}

	correct(word, distance) {
		const {words} = this;

		if (words.has(word)) {
			return word;
		}

		if (distance > 0) {
			const edits = this.edits(word);

			for (const edit of edits) {
				if (words.has(edit)) {
					return edit;
				}
			}

			if (distance > 1) {
				for (const edit of edits) {
					const correction = this.correct(edit, distance - 1);
					if (correction !== undefined) {
						return correction;
					}
				}
			}
		}
	}
}

const properties = new Set([
	...util.executionMethods,
	'context',
	'title',
	'skip'
]);

const correcter = new MicroCorrecter([...properties]);

const isCallExpression = node =>
	node.parent.type === 'CallExpression' &&
	node.parent.callee === node;

const getMemberNodes = node => {
	if (node.object.type === 'MemberExpression') {
		return getMemberNodes(node.object).concat(node.property);
	}

	return [node.property];
};

const correctIdentifier = name => correcter.correct(name, Math.max(0, Math.min(name.length - 2, 2)));

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

				let corrected = correctIdentifier(name);

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

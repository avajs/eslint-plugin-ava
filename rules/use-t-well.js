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

const nonMethods = new Set([
	'context',
	'title'
]);

const properties = new Set([
	...nonMethods,
	...util.executionMethods,
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

const correctIfNeeded = (name, context, node) => {
	const correction = correcter.correct(name, Math.max(0, Math.min(name.length - 2, 2)));
	if (correction === undefined) {
		return undefined;
	}

	if (correction !== name) {
		context.report({
			node,
			message: `Misspelled \`.${correction}\` as \`.${name}\`.`,
			fix: fixer => fixer.replaceText(node, correction)
		});
	}

	return correction;
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

			let hadSkip = false;
			let hadCall = false;
			let needCall = true;
			for (const [i, member] of members.entries()) {
				const {name} = member;
				const corrected = correctIfNeeded(name, context, member);
				if (corrected === undefined) {
					needCall = false;
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

					break;
				} else if (i === 0 && nonMethods.has(corrected)) {
					needCall = false;
					if (members.length === 1 && isCallExpression(node)) {
						context.report({
							node,
							message: `Unknown assertion method \`.${name}\`.`
						});
					}

					break;
				} else if (corrected === 'skip') {
					if (hadSkip) {
						context.report({
							node,
							message: 'Too many chained uses of `.skip`.'
						});
					}

					hadSkip = true;
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

			if (needCall && !hadCall) {
				context.report({
					node,
					message: 'Missing assertion method.'
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

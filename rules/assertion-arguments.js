'use strict';
const {visitIf} = require('enhance-visitors');
const {getStaticValue, isOpeningParenToken, isCommaToken} = require('eslint-utils');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const expectedNbArguments = {
	deepEqual: {
		min: 2,
		max: 3
	},
	fail: {
		min: 0,
		max: 1
	},
	false: {
		min: 1,
		max: 2
	},
	falsy: {
		min: 1,
		max: 2
	},
	ifError: {
		min: 1,
		max: 2
	},
	is: {
		min: 2,
		max: 3
	},
	like: {
		min: 2,
		max: 3
	},
	not: {
		min: 2,
		max: 3
	},
	notDeepEqual: {
		min: 2,
		max: 3
	},
	notThrows: {
		min: 1,
		max: 2
	},
	pass: {
		min: 0,
		max: 1
	},
	plan: {
		min: 1,
		max: 1
	},
	regex: {
		min: 2,
		max: 3
	},
	notRegex: {
		min: 2,
		max: 3
	},
	snapshot: {
		min: 1,
		max: 2
	},
	teardown: {
		min: 1,
		max: 1
	},
	throws: {
		min: 1,
		max: 3
	},
	true: {
		min: 1,
		max: 2
	},
	truthy: {
		min: 1,
		max: 2
	},
	timeout: {
		min: 1,
		max: 2
	}
};

const actualExpectedAssertions = new Set([
	'deepEqual', 'is', 'like', 'not', 'notDeepEqual', 'throws', 'throwsAsync'
]);

function isStatic(node) {
	const staticValue = getStaticValue(node);
	return staticValue !== null && typeof staticValue.value !== 'function';
}

function * sourceRangesOfArguments(sourceCode, callExpression) {
	const openingParen = sourceCode.getTokenAfter(
		callExpression.callee,
		{filter: token => isOpeningParenToken(token)}
	);
	const closingParen = sourceCode.getLastToken(callExpression);
	for (let index = 0; index < callExpression.arguments.length; index++) {
		const previousToken = index === 0 ?
			openingParen :
			sourceCode.getTokenBefore(
				callExpression.arguments[index],
				{filter: token => isCommaToken(token)}
			);
		const nextToken = index === callExpression.arguments.length - 1 ?
			closingParen :
			sourceCode.getTokenAfter(
				callExpression.arguments[index],
				{filter: token => isCommaToken(token)}
			);
		const firstToken = sourceCode.getTokenAfter(previousToken);
		const lastToken = sourceCode.getTokenBefore(nextToken);
		yield [firstToken.start, lastToken.end];
	}
}

const create = context => {
	const ava = createAvaRule();
	const options = context.options[0] || {};
	const enforcesMessage = Boolean(options.message);
	const shouldHaveMessage = options.message !== 'never';

	function report(node, message) {
		context.report({node, message});
	}

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode
		])(node => {
			const {callee} = node;

			if (
				callee.type !== 'MemberExpression' ||
				!callee.property ||
				util.getNameOfRootNodeObject(callee) !== 't' ||
				util.isPropertyUnderContext(callee)
			) {
				return;
			}

			const gottenArgs = node.arguments.length;
			const members = util.getMembers(callee).filter(name => name !== 'skip');

			if (members[0] === 'end') {
				if (gottenArgs > 1) {
					report(node, 'Too many arguments. Expected at most 1.');
				}

				return;
			}

			if (members[0] === 'try') {
				if (gottenArgs < 1) {
					report(node, 'Not enough arguments. Expected at least 1.');
				}

				return;
			}

			const nArgs = expectedNbArguments[members[0]];

			if (!nArgs) {
				return;
			}

			if (gottenArgs < nArgs.min) {
				report(node, `Not enough arguments. Expected at least ${nArgs.min}.`);
			} else if (node.arguments.length > nArgs.max) {
				report(node, `Too many arguments. Expected at most ${nArgs.max}.`);
			} else {
				if (enforcesMessage && nArgs.min !== nArgs.max) {
					const hasMessage = gottenArgs === nArgs.max;

					if (!hasMessage && shouldHaveMessage) {
						report(node, 'Expected an assertion message, but found none.');
					} else if (hasMessage && !shouldHaveMessage) {
						report(node, 'Expected no assertion message, but found one.');
					}
				}

				if (actualExpectedAssertions.has(members[0]) && gottenArgs >= 2) {
					const [leftNode, rightNode] = node.arguments;
					if (isStatic(leftNode) && !isStatic(rightNode)) {
						const sourceCode = context.getSourceCode();
						const [leftRange, rightRange] = sourceRangesOfArguments(sourceCode, node);
						context.report({
							message: 'Expected values should come after actual values.',
							loc: {
								start: sourceCode.getLocFromIndex(leftRange[0]),
								end: sourceCode.getLocFromIndex(rightRange[1])
							},
							fix(fixer) {
								const leftText = sourceCode.getText().slice(...leftRange);
								const rightText = sourceCode.getText().slice(...rightRange);
								return [
									fixer.replaceTextRange(leftRange, rightText),
									fixer.replaceTextRange(rightRange, leftText)
								];
							}
						});
					}
				}
			}
		})
	});
};

const schema = [{
	type: 'object',
	properties: {
		message: {
			enum: [
				'always',
				'never'
			],
			default: undefined
		}
	}
}];

module.exports = {
	create,
	meta: {
		fixable: 'code',
		docs: {
			url: util.getDocsUrl(__filename)
		},
		schema,
		type: 'problem'
	}
};

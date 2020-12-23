'use strict';
const {visitIf} = require('enhance-visitors');
const {getStaticValue, isOpeningParenToken, isCommaToken, findVariable} = require('eslint-utils');
const util = require('../util');
const createAvaRule = require('../create-ava-rule');

const expectedNbArguments = {
	assert: {
		min: 1,
		max: 2
	},
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
	notThrowsAsync: {
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
	throwsAsync: {
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
	'deepEqual',
	'is',
	'like',
	'not',
	'notDeepEqual',
	'throws',
	'throwsAsync'
]);

const relationalActualExpectedAssertions = new Set([
	'assert',
	'truthy',
	'falsy',
	'true',
	'false'
]);

const comparisonOperators = new Map([
	['>', '<'],
	['>=', '<='],
	['==', '=='],
	['===', '==='],
	['!=', '!='],
	['!==', '!=='],
	['<=', '>='],
	['<', '>']
]);

const flipOperator = operator => comparisonOperators.get(operator);

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

	for (const [index, argument] of callExpression.arguments.entries()) {
		const previousToken = index === 0 ?
			openingParen :
			sourceCode.getTokenBefore(
				argument,
				{filter: token => isCommaToken(token)}
			);

		const nextToken = index === callExpression.arguments.length - 1 ?
			closingParen :
			sourceCode.getTokenAfter(
				argument,
				{filter: token => isCommaToken(token)}
			);

		const firstToken = sourceCode.getTokenAfter(
			previousToken,
			{includeComments: true}
		);

		const lastToken = sourceCode.getTokenBefore(
			nextToken,
			{includeComments: true}
		);

		yield [firstToken.range[0], lastToken.range[1]];
	}
}

function sourceOfBinaryExpressionComponents(sourceCode, node) {
	const {operator, left, right} = node;

	const operatorToken = sourceCode.getFirstTokenBetween(
		left,
		right,
		{filter: token => token.value === operator}
	);

	const previousToken = sourceCode.getTokenBefore(node);
	const nextToken = sourceCode.getTokenAfter(node);

	const leftRange = [
		sourceCode.getTokenAfter(previousToken, {includeComments: true}).range[0],
		sourceCode.getTokenBefore(operatorToken, {includeComments: true}).range[1]
	];

	const rightRange = [
		sourceCode.getTokenAfter(operatorToken, {includeComments: true}).range[0],
		sourceCode.getTokenBefore(nextToken, {includeComments: true}).range[1]
	];

	return [leftRange, operatorToken, rightRange];
}

function noComments(sourceCode, ...nodes) {
	return nodes.every(node => {
		return sourceCode.getCommentsBefore(node).length === 0 && sourceCode.getCommentsAfter(node).length === 0;
	});
}

function isString(node) {
	const {type} = node;
	return type === 'TemplateLiteral' ||
		type === 'TaggedTemplateExpression' ||
		(type === 'Literal' && typeof node.value === 'string');
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
			const firstNonSkipMember = util.getMembers(callee).find(name => name !== 'skip');

			if (firstNonSkipMember === 'end') {
				if (gottenArgs > 1) {
					report(node, 'Too many arguments. Expected at most 1.');
				}

				return;
			}

			if (firstNonSkipMember === 'try') {
				if (gottenArgs < 1) {
					report(node, 'Not enough arguments. Expected at least 1.');
				}

				return;
			}

			const nArgs = expectedNbArguments[firstNonSkipMember];

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

				checkArgumentOrder({node, assertion: firstNonSkipMember, context});
			}

			if (gottenArgs === nArgs.max && nArgs.min !== nArgs.max) {
				let lastArg = node.arguments[node.arguments.length - 1];

				if (lastArg.type === 'Identifier') {
					const variable = findVariable(context.getScope(), lastArg);
					let value;
					for (const ref of variable.references) {
						value = ref.writeExpr || value;
					}

					lastArg = value;
				}

				if (!isString(lastArg)) {
					report(node, 'Assertion message should be a string.');
				}
			}
		})
	});
};

function checkArgumentOrder({node, assertion, context}) {
	const [first, second] = node.arguments;
	if (actualExpectedAssertions.has(assertion) && second) {
		const [leftNode, rightNode] = [first, second];
		if (isStatic(leftNode) && !isStatic(rightNode)) {
			context.report(
				makeOutOfOrder2ArgumentReport({node, leftNode, rightNode, context})
			);
		}
	} else if (
		relationalActualExpectedAssertions.has(assertion) &&
		first &&
		first.type === 'BinaryExpression' &&
		comparisonOperators.has(first.operator)
	) {
		const [leftNode, rightNode] = [first.left, first.right];
		if (isStatic(leftNode) && !isStatic(rightNode)) {
			context.report(
				makeOutOfOrder1ArgumentReport({node: first, leftNode, rightNode, context})
			);
		}
	}
}

function makeOutOfOrder2ArgumentReport({node, leftNode, rightNode, context}) {
	const sourceCode = context.getSourceCode();
	const [leftRange, rightRange] = sourceRangesOfArguments(sourceCode, node);
	const report = {
		message: 'Expected values should come after actual values.',
		loc: {
			start: sourceCode.getLocFromIndex(leftRange[0]),
			end: sourceCode.getLocFromIndex(rightRange[1])
		}
	};

	if (noComments(sourceCode, leftNode, rightNode)) {
		report.fix = fixer => {
			const leftText = sourceCode.getText().slice(...leftRange);
			const rightText = sourceCode.getText().slice(...rightRange);
			return [
				fixer.replaceTextRange(leftRange, rightText),
				fixer.replaceTextRange(rightRange, leftText)
			];
		};
	}

	return report;
}

function makeOutOfOrder1ArgumentReport({node, leftNode, rightNode, context}) {
	const sourceCode = context.getSourceCode();
	const [
		leftRange,
		operatorToken,
		rightRange
	] = sourceOfBinaryExpressionComponents(sourceCode, node);
	const report = {
		message: 'Expected values should come after actual values.',
		loc: {
			start: sourceCode.getLocFromIndex(leftRange[0]),
			end: sourceCode.getLocFromIndex(rightRange[1])
		}
	};

	if (noComments(sourceCode, leftNode, rightNode, node)) {
		report.fix = fixer => {
			const leftText = sourceCode.getText().slice(...leftRange);
			const rightText = sourceCode.getText().slice(...rightRange);
			return [
				fixer.replaceTextRange(leftRange, rightText),
				fixer.replaceText(operatorToken, flipOperator(node.operator)),
				fixer.replaceTextRange(rightRange, leftText)
			];
		};
	}

	return report;
}

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

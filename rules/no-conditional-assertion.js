import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-conditional-assertion';

const conditionalTypes = new Set(['IfStatement', 'SwitchCase', 'ConditionalExpression', 'CatchClause', 'LogicalExpression']);
const abruptStatementTypes = new Set(['BreakStatement', 'ContinueStatement']);

function isAssertionCall(node) {
	if (node.type !== 'CallExpression' || node.callee?.type !== 'MemberExpression') {
		return false;
	}

	const rootName = util.getNameOfRootNodeObject(node.callee);
	if (!util.isTestObject(rootName)) {
		return false;
	}

	return util.assertionMethods.has(util.getMembers(node.callee)[0]);
}

function analyzeStatements(statements) {
	let pending = true;
	let failed = false;

	for (const statement of statements) {
		if (!pending) {
			break;
		}

		const result = analyzeAssertionPaths(statement);
		pending = result.pending;
		failed ||= result.failed;
	}

	return {pending, failed};
}

function analyzeSwitchCaseByIndex(switchStatement, caseIndex) {
	let pending = true;
	let failed = false;

	for (let index = caseIndex; index < switchStatement.cases.length; index++) {
		if (!pending) {
			break;
		}

		const currentCase = switchStatement.cases[index];
		const result = analyzeStatements(currentCase.consequent);
		pending = result.pending;
		failed ||= result.failed;
	}

	return {pending, failed};
}

function analyzeSwitchStatement(switchStatement) {
	const hasDefault = switchStatement.cases.some(c => c.test === null);
	let pending = !hasDefault;
	let failed = false;

	for (let index = 0; index < switchStatement.cases.length; index++) {
		const result = analyzeSwitchCaseByIndex(switchStatement, index);
		pending ||= result.pending;
		failed ||= result.failed;
	}

	return {pending, failed};
}

function mergePathResults(left, right) {
	return {
		pending: left.pending || right.pending,
		failed: left.failed || right.failed,
	};
}

function hasGuaranteedAssertion(result) {
	return !result.pending && !result.failed;
}

function analyzeTryStatement(tryStatement) {
	const tryResult = analyzeAssertionPaths(tryStatement.block);

	let handledResult = tryResult;
	if (tryStatement.handler) {
		const catchResult = analyzeAssertionPaths(tryStatement.handler.body);
		handledResult = mergePathResults(tryResult, catchResult);
	}

	if (!tryStatement.finalizer) {
		return handledResult;
	}

	const finalizerResult = analyzeAssertionPaths(tryStatement.finalizer);
	if (hasGuaranteedAssertion(handledResult) || hasGuaranteedAssertion(finalizerResult)) {
		return {pending: false, failed: false};
	}

	return mergePathResults(handledResult, finalizerResult);
}

function analyzeLogicalExpression(logicalExpression) {
	const leftResult = analyzeAssertionPaths(logicalExpression.left);
	if (hasGuaranteedAssertion(leftResult)) {
		return leftResult;
	}

	const rightResult = analyzeAssertionPaths(logicalExpression.right);
	return mergePathResults(leftResult, rightResult);
}

function unwrapPathNode(node) {
	if (node.type === 'ExpressionStatement') {
		return node.expression;
	}

	if (node.type === 'AwaitExpression') {
		return node.argument;
	}

	if (node.type === 'ChainExpression') {
		return node.expression;
	}
}

function analyzeNodeByType(node) {
	if (node.type === 'SequenceExpression') {
		return analyzeStatements(node.expressions);
	}

	if (node.type === 'BlockStatement') {
		return analyzeStatements(node.body);
	}

	if (node.type === 'IfStatement') {
		const consequent = analyzeAssertionPaths(node.consequent);
		if (!node.alternate) {
			return {pending: true, failed: consequent.failed};
		}

		const alternate = analyzeAssertionPaths(node.alternate);
		return mergePathResults(consequent, alternate);
	}

	if (node.type === 'ConditionalExpression') {
		const consequent = analyzeAssertionPaths(node.consequent);
		const alternate = analyzeAssertionPaths(node.alternate);
		return mergePathResults(consequent, alternate);
	}

	if (node.type === 'ReturnStatement' || node.type === 'ThrowStatement') {
		if (!node.argument) {
			return {pending: false, failed: true};
		}

		const argumentResult = analyzeAssertionPaths(node.argument);
		return {
			pending: false,
			failed: argumentResult.failed || argumentResult.pending,
		};
	}

	if (node.type === 'SwitchStatement') {
		return analyzeSwitchStatement(node);
	}

	if (node.type === 'TryStatement') {
		return analyzeTryStatement(node);
	}

	if (node.type === 'LogicalExpression') {
		return analyzeLogicalExpression(node);
	}
}

function analyzeAssertionPaths(node) {
	if (!node) {
		return {pending: true, failed: false};
	}

	if (isAssertionCall(node)) {
		return {pending: false, failed: false};
	}

	const unwrappedNode = unwrapPathNode(node);
	if (unwrappedNode) {
		return analyzeAssertionPaths(unwrappedNode);
	}

	const typedResult = analyzeNodeByType(node);
	if (typedResult) {
		return typedResult;
	}

	if (abruptStatementTypes.has(node.type)) {
		return {pending: false, failed: true};
	}

	return {pending: true, failed: false};
}

function hasAssertionInEveryPath(node) {
	const result = analyzeAssertionPaths(node);
	return !result.pending && !result.failed;
}

function switchCaseHasAssertionByFallthrough(switchCase) {
	const switchStatement = switchCase.parent;
	const caseIndex = switchStatement.cases.indexOf(switchCase);
	const result = analyzeSwitchCaseByIndex(switchStatement, caseIndex);
	return !result.pending && !result.failed;
}

function isBalanced(node) {
	switch (node.type) {
		case 'IfStatement': {
			return node.alternate
				&& hasAssertionInEveryPath(node.consequent)
				&& hasAssertionInEveryPath(node.alternate);
		}

		case 'ConditionalExpression': {
			return hasAssertionInEveryPath(node.consequent)
				&& hasAssertionInEveryPath(node.alternate);
		}

		case 'SwitchCase': {
			const switchStatement = node.parent;
			const hasDefault = switchStatement.cases.some(c => c.test === null);
			return hasDefault && switchStatement.cases.every(c => switchCaseHasAssertionByFallthrough(c));
		}

		// Catch blocks may never execute
		case 'CatchClause': {
			return false;
		}

		default: {
			return false;
		}
	}
}

function * conditionalAncestors(node) {
	let child = node;
	let current = node.parent;
	while (current) {
		if (conditionalTypes.has(current.type) && shouldTrackConditionalAncestor(current, child)) {
			yield current;
		}

		child = current;
		current = current.parent;
	}
}

function shouldTrackConditionalAncestor(node, child) {
	if (node.type === 'IfStatement' || node.type === 'ConditionalExpression') {
		return child !== node.test;
	}

	if (node.type === 'LogicalExpression') {
		return child === node.right;
	}

	return true;
}

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([ava.isInTestFile, ava.isInTestNode])(node => {
			if (!isAssertionCall(node)) {
				return;
			}

			for (const conditional of conditionalAncestors(node)) {
				if (!isBalanced(conditional)) {
					context.report({node, messageId: MESSAGE_ID});
					break;
				}
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow assertions inside conditional statements.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Assertions should not be placed inside conditionals, as they may never execute.',
		},
	},
};

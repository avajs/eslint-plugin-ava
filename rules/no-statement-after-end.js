'use strict';
const createAvaRule = require('../create-ava-rule');
const util = require('../util');

// This rule makes heavy use of ESLint's code path analysis
// See: https://eslint.org/docs/developer-guide/code-path-analysis.html

// Returns true if this node represents a call to `t.end(...)`
const isEndExpression = node =>
	node.type === 'CallExpression' &&
	node.callee.type === 'MemberExpression' &&
	node.callee.object.type === 'Identifier' &&
	node.callee.object.name === 't' &&
	node.callee.property.type === 'Identifier' &&
	node.callee.property.name === 'end';

const create = context => {
	const ava = createAvaRule();
	const segmentInfoMap = new Map();
	const segmentInfoStack = [];

	let currentSegmentInfo;

	function pathStart() {
		if (currentSegmentInfo !== undefined) {
			segmentInfoStack.push(currentSegmentInfo);
			currentSegmentInfo = undefined;
		}
	}

	function pathEnd() {
		currentSegmentInfo = segmentInfoStack.pop();
	}

	function segmentStart(segment) {
		// A new CodePathSegment has started, create an "info" object to track this segments state.
		currentSegmentInfo = {
			ended: false,
			prev: segment.prevSegments.map(previousSegment => segmentInfoMap.get(previousSegment.id))
		};

		segmentInfoMap.set(segment.id, currentSegmentInfo);
	}

	function segmentEnd() {
		currentSegmentInfo = undefined;
	}

	function checkForEndExpression(node) {
		if (isEndExpression(node) && currentSegmentInfo !== undefined) {
			currentSegmentInfo.ended = true;
		}
	}

	function checkStatement(node) {
		if (!ava.isInTestFile()) {
			return;
		}

		// If there is no current segment (this occurs in unreachable code), then we
		// can't check whether `t.end()` was called
		if (currentSegmentInfo === undefined) {
			return;
		}

		const ended = [currentSegmentInfo, ...currentSegmentInfo.prev].filter(info => info.ended);

		// If this segment or any previous segment is already ended, further statements are not allowed, report as an error.
		if (ended.length > 0) {
			for (const info of ended) {
				// Unset ended state to avoid generating lots of errors
				info.ended = false;
			}

			context.report({
				node,
				message: 'No statements following a call to `t.end()`.'
			});
		}
	}

	return ava.merge({
		ExpressionStatement: checkStatement,
		WithStatement: checkStatement,
		IfStatement: checkStatement,
		SwitchStatement: checkStatement,
		ThrowStatement: checkStatement,
		TryStatement: checkStatement,
		WhileStatement: checkStatement,
		DoWhileStatement: checkStatement,
		ForStatement: checkStatement,
		ForInStatement: checkStatement,
		ForOfStatement: checkStatement,
		ReturnStatement: node => {
			// Empty return statements are OK even after `t.end`,
			// only check it if there is an argument
			if (node.argument) {
				checkStatement(node);
			}
		},
		onCodePathStart: pathStart,
		onCodePathEnd: pathEnd,
		onCodePathSegmentStart: segmentStart,
		onCodePathSegmentEnd: segmentEnd,
		CallExpression: checkForEndExpression
	});
};

module.exports = {
	create,
	meta: {
		docs: {
			url: util.getDocsUrl(__filename)
		},
		type: 'problem'
	}
};

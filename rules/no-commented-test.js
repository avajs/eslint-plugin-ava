'use strict';
var acorn = require('acorn/dist/acorn_loose');
var estraverse = require('estraverse');
var numLines = require('num-lines');
var createAvaRule = require('../create-ava-rule');

module.exports = function (context) {
	var processedUpTo = -1;

	function concatComments(commentBlock) {
		var endOfLastComment = commentBlock[commentBlock.length - 1].end;

		// Comments are often attached as "trailing" on one node, and "leading" on the next.
		// Avoid double processing the same block.
		if (processedUpTo >= endOfLastComment) {
			return null;
		}

		processedUpTo = endOfLastComment;

		return commentBlock.map(function (commentNode) {
			return commentNode.value;
		}).join('\n');
	}

	function process(commentBlock) {
		if (!commentBlock || !commentBlock.length) {
			return;
		}

		var src = concatComments(commentBlock);

		// Does a best effort parse of the code. AST will contain `x` Identifiers for chunks it can't parse.
		var ast = acorn.parse_dammit(src, {locations: true});

		// Traverse the contents of the comment block, looking for a test call.
		estraverse.traverse(ast, {
			enter: function (node) {
				if (node.type !== 'CallExpression') {
					return;
				}

				if (isTestFunctionCall(node.callee)) {
					var loc = translateLocation(node.loc.start, commentBlock);

					context.report({
						message: 'use test.skip instead of commenting out tests',
						loc: loc
					});
				}
			}
		});
	}

	var ava = createAvaRule();

	function visitNode(node) {
		if (!ava.isTestFile) {
			return;
		}

		process(node.leadingComments);
		process(node.trailingComments);
	}

	// build the visitor object, we want to asses the comments around any XxxStatement node.
	var visitor = {};

	Object.keys(estraverse.Syntax).forEach(function (name) {
		if (/Statement$/.test(name)) {
			visitor[name] = visitNode;
		}
	});

	return ava.merge(visitor);
};

function translateLocation(locationInComments, commentBlock) {
	var linesLeft = locationInComments.line;

	for (var i = 0; i < commentBlock.length; i++) {
		var commentNode = commentBlock[i];
		var linesThisComment = numLines(commentNode.value);

		if (linesThisComment >= linesLeft) {
			return {
				line: commentNode.loc.start.line + linesLeft - 1,
				column: linesLeft === 1 ?
					commentNode.loc.start.column + locationInComments.column + 2 :
					locationInComments.column
			};
		}

		linesLeft -= linesThisComment;
	}

	// TODO: Probably should not throw here. Maybe return `null` and modify the message warning the exact location could not be found?
	// This should be unreachable code, so would like to encourage bug reports if that ever proves untrue.
	throw new Error('unable to translate location');
}

function isTestFunctionCall(node) {
	if (node.type === 'Identifier') {
		return node.name === 'test';
	} else if (node.type === 'MemberExpression') {
		return isTestFunctionCall(node.object);
	}

	return false;
}

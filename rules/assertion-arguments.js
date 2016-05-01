'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var expectedNbArguments = {
	deepEqual: 2,
	end: 0,
	fail: 0,
	false: 1,
	falsy: 1,
	ifError: 1,
	is: 2,
	not: 2,
	notDeepEqual: 2,
	notThrows: 1,
	pass: 0,
	plan: 1,
	regex: 2,
	throws: 1,
	true: 1,
	truthy: 1
};

var fixedNbArguments = {
	end: true,
	plan: true
};

function nbArguments(node) {
	var name = node.property.name;
	var nArgs = expectedNbArguments[name];
	if (nArgs !== undefined) {
		return {
			min: nArgs,
			max: fixedNbArguments[name] ? nArgs : nArgs + 1
		};
	}

	if (node.object.type === 'MemberExpression') {
		return nbArguments(node.object);
	}

	return false;
}

module.exports = function (context) {
	var ava = createAvaRule();
	var options = context.options[0] || {};
	var enforcesMessage = Boolean(options.message);
	var shouldHaveMessage = options.message !== 'never';

	function report(node, message) {
		context.report({
			node: node,
			message: message
		});
	}

	return ava.merge({
		CallExpression: function (node) {
			if (!ava.isTestFile || !ava.currentTestNode || node.callee.type !== 'MemberExpression') {
				return;
			}

			var callee = node.callee;
			if (!callee.property || util.nameOfRootObject(callee) !== 't' || util.isInContext(callee)) {
				return;
			}

			var gottenArgs = node.arguments.length;
			var nArgs = nbArguments(callee);
			if (!nArgs) {
				return;
			}

			if (gottenArgs < nArgs.min) {
				report(node, 'Not enough arguments. Expected at least ' + nArgs.min + '.');
			} else if (node.arguments.length > nArgs.max) {
				report(node, 'Too many arguments. Expected at most ' + nArgs.max + '.');
			} else if (enforcesMessage && nArgs.min !== nArgs.max) {
				var hasMessage = nArgs.max === gottenArgs;
				if (!hasMessage && shouldHaveMessage) {
					report(node, 'Expected an assertion message, but found none.');
				} else if (hasMessage && !shouldHaveMessage) {
					report(node, 'Expected no assertion message, but found one.');
				}
			}
		}
	});
};

module.exports.schema = [{
	type: 'object',
	properties: {
		message: {
			enum: [
				'always',
				'never'
			]
		}
	}
}];

'use strict';
var util = require('../util');
var createAvaRule = require('../create-ava-rule');

var methods = [
	'end', 'pass', 'fail', 'truthy', 'falsy', 'true', 'false', 'is', 'not',
	'deepEqual', 'notDeepEqual', 'throws', 'notThrows', 'regex', 'ifError', 'plan'
];

function isMethod(name) {
	return methods.indexOf(name) !== -1;
}

function getMembers(node) {
	var name = node.property.name;
	if (node.object.type === 'MemberExpression') {
		return getMembers(node.object).concat(name);
	}

	return [name];
}

function isCallExpression(node) {
	return node.parent.type === 'CallExpression' &&
		node.parent.callee === node;
}

function getMemberStats(members) {
	var initial = {
		skip: [],
		method: [],
		other: []
	};

	return members.reduce(function (res, member) {
		if (member === 'skip') {
			res.skip.push(member);
		} else if (isMethod(member)) {
			res.method.push(member);
		} else {
			res.other.push(member);
		}

		return res;
	}, initial);
}

module.exports = function (context) {
	var ava = createAvaRule();

	return ava.merge({
		CallExpression: function (node) {
			if (ava.isTestFile &&
					ava.currentTestNode &&
					node.callee.type !== 'MemberExpression' &&
					node.callee.name === 't') {
				context.report(node, '`t` is not a function');
			}
		},
		MemberExpression: function (node) {
			if (!ava.isTestFile ||
					!ava.currentTestNode ||
					node.parent.type === 'MemberExpression' ||
					util.nameOfRootObject(node) !== 't') {
				return;
			}

			var members = getMembers(node);
			var stats = getMemberStats(members);

			if (members[0] === 'context') {
				// Anything is fine when of the form `t.context...`
				if (members.length === 1 && isCallExpression(node)) {
					// except `t.context()`
					context.report(node, 'Unknown assertion method `context`');
				}

				return;
			}

			if (isCallExpression(node)) {
				if (stats.other.length > 0) {
					context.report(node, 'Unknown assertion method `' + stats.other[0] + '`');
				} else if (stats.skip.length > 1) {
					context.report(node, 'Too many chained uses of `skip`');
				} else if (stats.method.length > 1) {
					context.report(node, 'Can\'t chain assertion methods');
				} else if (stats.method.length === 0) {
					context.report(node, 'Missing assertion method');
				}
			} else if (stats.other.length > 0) {
				context.report(node, 'Unknown member `' + stats.other[0] + '`. Use `context.' + stats.other[0] + '` instead');
			}
		}
	});
};

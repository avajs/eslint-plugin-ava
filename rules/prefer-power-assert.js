import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'prefer-power-assert';

const notAllowed = new Set([
	'truthy',
	'true',
	'falsy',
	'false',
	'is',
	'not',
	'regex',
	'notRegex',
	'ifError',
]);

const isNotAllowedAssertion = callee => {
	if (callee.type !== 'MemberExpression' || callee.computed) {
		return false;
	}

	// Only match real AVA assertion calls like `t.is()` and `t.is.skip()`.
	// Malformed chains such as `t.is.context()` should be left to `use-t-well`.
	const assertionMethod = util.getAssertionName(callee);
	if (!assertionMethod) {
		return false;
	}

	const root = util.getRootNode(callee);
	return root.object.type === 'Identifier'
		&& util.isTestObject(root.object.name)
		&& notAllowed.has(assertionMethod);
};

const create = context => {
	const ava = createAvaRule(context.sourceCode);

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (isNotAllowedAssertion(node.callee)) {
				context.report({
					node,
					messageId: MESSAGE_ID,
				});
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Enforce using only assertions compatible with [power-assert](https://github.com/power-assert-js/power-assert).',
			recommended: false,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Only asserts with no power-assert alternative are allowed.',
		},
	},
};

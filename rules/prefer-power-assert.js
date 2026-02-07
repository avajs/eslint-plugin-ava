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

	const {object} = callee;

	// Match: t.method()
	if (object.type === 'Identifier') {
		return util.isTestObject(object.name) && notAllowed.has(callee.property.name);
	}

	// Match: t.skip.method()
	return object.type === 'MemberExpression'
		&& !object.computed
		&& object.property.name === 'skip'
		&& object.object.type === 'Identifier'
		&& util.isTestObject(object.object.name)
		&& notAllowed.has(callee.property.name);
};

const create = context => {
	const ava = createAvaRule();

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

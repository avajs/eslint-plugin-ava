import {isDeepStrictEqual} from 'node:util';
import espurify from 'espurify';
import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const notAllowed = [
	'truthy',
	'true',
	'falsy',
	'false',
	'is',
	'not',
	'regex',
	'notRegex',
	'ifError',
];

const assertionCalleeAst = methodName => ({
	type: 'MemberExpression',
	object: {
		type: 'Identifier',
		name: 't',
	},
	property: {
		type: 'Identifier',
		name: methodName,
	},
	computed: false,
});

const skippedAssertionCalleeAst = methodName => ({
	type: 'MemberExpression',
	object: {
		type: 'MemberExpression',
		object: {
			type: 'Identifier',
			name: 't',
		},
		property: {
			type: 'Identifier',
			name: 'skip',
		},
		computed: false,
	},
	property: {
		type: 'Identifier',
		name: methodName,
	},
	computed: false,
});

const isCalleeMatched = (callee, methodName) =>
	isDeepStrictEqual(callee, assertionCalleeAst(methodName))
	|| isDeepStrictEqual(callee, skippedAssertionCalleeAst(methodName));

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			const callee = espurify(node.callee);

			if (callee.type === 'MemberExpression') {
				for (const methodName of notAllowed) {
					if (isCalleeMatched(callee, methodName)) {
						context.report({
							node,
							message: 'Only asserts with no power-assert alternative are allowed.',
						});
					}
				}
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Enforce the use of the asserts that have no [power-assert](https://github.com/power-assert-js/power-assert) alternative.',
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
	},
};

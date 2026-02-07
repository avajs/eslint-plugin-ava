import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-async-fn-without-await';
const MESSAGE_ID_SUGGESTION = 'no-async-fn-without-await-suggestion';

const create = context => {
	const ava = createAvaRule();
	let testUsed = false;
	let asyncTest;

	const registerUseOfAwait = () => {
		if (asyncTest) {
			testUsed = true;
		}
	};

	const isAsync = node => Boolean(node?.async);

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			asyncTest = (isAsync(node.arguments[0]) && node.arguments[0])
				|| (isAsync(node.arguments[1]) && node.arguments[1]);
		}),
		AwaitExpression: registerUseOfAwait,
		YieldExpression: registerUseOfAwait,
		'ForOfStatement[await=true]': registerUseOfAwait,
		'CallExpression:exit': visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(() => {
			if (asyncTest && !testUsed) {
				const {sourceCode} = context;
				const asyncToken = sourceCode.getFirstToken(asyncTest, token => token.value === 'async');
				context.report({
					node: asyncTest,
					loc: {
						start: asyncTest.loc.start,
						end: asyncTest.loc.start + 5,
					},
					messageId: MESSAGE_ID,
					suggest: [{
						messageId: MESSAGE_ID_SUGGESTION,
						fix(fixer) {
							const nextToken = sourceCode.getTokenAfter(asyncToken);
							return fixer.removeRange([asyncToken.range[0], nextToken.range[0]]);
						},
					}],
				});
			}

			asyncTest = undefined;
			testUsed = false;
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require async tests to use `await`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Function was declared as `async` but doesn\'t use `await`.',
			[MESSAGE_ID_SUGGESTION]: 'Remove the `async` keyword.',
		},
	},
};

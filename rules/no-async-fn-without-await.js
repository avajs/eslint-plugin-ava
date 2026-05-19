import createAvaRule, {visitIf} from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-async-fn-without-await';
const MESSAGE_ID_SUGGESTION = 'no-async-fn-without-await-suggestion';

const create = context => {
	const ava = createAvaRule(context.sourceCode);
	const {sourceCode} = context;
	let testUsed = false;
	let asyncTest;
	let nestedFunctionDepth = 0;

	const registerUseOfAwait = () => {
		if (asyncTest && nestedFunctionDepth === 0) {
			testUsed = true;
		}
	};

	const enterFunction = node => {
		if (asyncTest && node !== asyncTest) {
			nestedFunctionDepth++;
		}
	};

	const exitFunction = node => {
		if (asyncTest && node !== asyncTest) {
			nestedFunctionDepth--;
		}
	};

	const isAsync = node => Boolean(node?.async);

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const implementationArgument = util.getExecutableTestImplementation(node, sourceCode);
			asyncTest = isAsync(implementationArgument) && implementationArgument;
		}),
		':function': enterFunction,
		':function:exit': exitFunction,
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
					loc: asyncToken.loc,
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
			nestedFunctionDepth = 0;
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

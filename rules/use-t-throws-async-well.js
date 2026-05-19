import createAvaRule, {visitIf} from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'use-t-throws-async-well';

const isThrowsAsyncAssertion = callee => {
	// `.skip` swaps in AVA's synchronous skip helper, so only the real async assertions need `await`.
	if (
		callee.type !== 'MemberExpression'
		|| (callee.property.name !== 'throwsAsync' && callee.property.name !== 'notThrowsAsync')
	) {
		return false;
	}

	return callee.object.type === 'Identifier' && util.isTestObject(callee.object.name);
};

const create = context => {
	const ava = createAvaRule(context.sourceCode);
	const {sourceCode} = context;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (
				node.parent.type === 'ExpressionStatement'
				&& isThrowsAsyncAssertion(node.callee)
			) {
				const testNode = ava.isInTestNode();
				const implementation = util.getExecutableTestImplementation(testNode, sourceCode);
				const fix = implementation?.async
					? fixer => fixer.replaceText(node.callee, `await ${sourceCode.getText(node.callee)}`)
					: undefined;
				context.report({
					node,
					messageId: MESSAGE_ID,
					data: {method: node.callee.property.name},
					fix,
				});
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'problem',
		docs: {
			description: 'Require `t.throwsAsync()` and `t.notThrowsAsync()` to be awaited.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Use `await` with `t.{{method}}()`.',
		},
	},
};

import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'max-asserts';

const notAssertionMethods = new Set(['plan', 'end']);

const create = context => {
	const ava = createAvaRule(context);
	const {max: maxAssertions} = context.options[0];
	let assertionCount = 0;
	let nodeToReport;

	return ava.merge({
		CallExpression(node) {
			if (!ava.isInTestFile() || !ava.isInTestNode(node)) {
				return;
			}

			const {callee} = node;

			if (callee.type !== 'MemberExpression') {
				return;
			}

			if (
				callee.property
				&& !notAssertionMethods.has(callee.property.name)
				&& util.isTestObject(util.getNameOfRootNodeObject(callee))
			) {
				const firstNonSkipMember = util.getMembers(callee).find(name => name !== 'skip');

				if (!util.assertionMethods.has(firstNonSkipMember)) {
					return;
				}

				assertionCount++;

				if (assertionCount === maxAssertions + 1) {
					nodeToReport = node;
				}
			}
		},
		'CallExpression:exit'(node) {
			if (!ava.isTestNode(node)) {
				return;
			}

			// Leaving test function
			if (assertionCount > maxAssertions) {
				context.report({
					node: nodeToReport,
					messageId: MESSAGE_ID,
					data: {max: maxAssertions, count: assertionCount},
				});
			}

			assertionCount = 0;
			nodeToReport = undefined;
		},
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Limit the number of assertions in a test.',
			recommended: false,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [
			{
				type: 'object',
				properties: {
					max: {
						description: 'The maximum number of assertions allowed per test.',
						type: 'integer',
						minimum: 1,
					},
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{max: 5}],
		messages: {
			[MESSAGE_ID]: 'Expected at most {{max}} assertions, but found {{count}}.',
		},
	},
};

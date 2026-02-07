import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'max-asserts';

const notAssertionMethods = new Set(['plan', 'end']);

const create = context => {
	const ava = createAvaRule();
	const {max: maxAssertions} = context.options[0];
	let assertionCount = 0;
	let nodeToReport;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			const {callee} = node;

			if (callee.type !== 'MemberExpression') {
				return;
			}

			if (
				callee.property
				&& !notAssertionMethods.has(callee.property.name)
				&& util.getNameOfRootNodeObject(callee) === 't'
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
		}),
		'CallExpression:exit': visitIf([ava.isTestNode])(() => {
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
		}),
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

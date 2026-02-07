import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'test-title-format';

const create = context => {
	const ava = createAvaRule();

	let titleRegExp;
	if (context.options[0]?.format) {
		titleRegExp = new RegExp(context.options[0].format);
	} else {
		return {};
	}

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
			ava.hasNoUtilityModifier,
		])(node => {
			const requiredLength = ava.hasTestModifier('todo') ? 1 : 2;
			const hasTitle = node.arguments.length >= requiredLength;

			if (hasTitle) {
				const title = node.arguments[0];
				if (title.type === 'Literal' && !titleRegExp.test(title.value)) {
					context.report({
						node,
						messageId: MESSAGE_ID,
						data: {format: String(titleRegExp)},
					});
				}
			}
		}),
	});
};

const schema = [
	{
		type: 'object',
		properties: {
			format: {
				description: 'Regular expression pattern that test titles must match.',
				type: 'string',
			},
		},
		additionalProperties: false,
	},
];

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require test titles to match a pattern.',
			recommended: false,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema,
		defaultOptions: [{}],
		messages: {
			[MESSAGE_ID]: 'The test title doesn\'t match the required format: `{{format}}`.',
		},
	},
};

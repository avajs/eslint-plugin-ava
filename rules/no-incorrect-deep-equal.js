import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-deep-equal-with-primitive';

const create = context => {
	const ava = createAvaRule(context.sourceCode);

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			const {callee} = node;

			if (callee.type !== 'MemberExpression') {
				return;
			}

			const root = util.getRootNode(callee);

			if (
				root.object.type !== 'Identifier'
				|| !util.isTestObject(root.object.name)
			) {
				return;
			}

			const name = util.getAssertionName(callee);
			if (!name) {
				return;
			}

			if (name !== 'deepEqual' && name !== 'notDeepEqual') {
				return;
			}

			if (!node.arguments.slice(0, 2).some(argument => util.isPrimitive(argument))) {
				return;
			}

			const replacement = name === 'deepEqual' ? 'is' : 'not';

			context.report({
				node,
				messageId: MESSAGE_ID,
				data: {callee: name},
				fix: fixer => fixer.replaceText(root.property, replacement),
			});
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow using `deepEqual` with primitives.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Avoid using `{{callee}}` with literal primitives',
		},
	},
};

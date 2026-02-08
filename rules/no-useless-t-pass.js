import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-useless-t-pass';

const create = context => {
	const ava = createAvaRule();
	let hasPlan = false;
	let passNodes = [];

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
				!callee.property
				|| !util.isTestObject(util.getNameOfRootNodeObject(callee))
				|| util.isPropertyUnderContext(callee)
			) {
				return;
			}

			const firstNonSkipMember = util.getMembers(callee).find(name => name !== 'skip');

			if (firstNonSkipMember === 'plan') {
				hasPlan = true;
			} else if (firstNonSkipMember === 'pass') {
				passNodes.push(node);
			}
		}),
		'CallExpression:exit': visitIf([ava.isTestNode])(() => {
			if (!hasPlan) {
				for (const node of passNodes) {
					context.report({
						node,
						messageId: MESSAGE_ID,
					});
				}
			}

			hasPlan = false;
			passNodes = [];
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow useless `t.pass()`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		schema: [],
		messages: {
			[MESSAGE_ID]: '`t.pass()` is useless without `t.plan()`.',
		},
	},
};

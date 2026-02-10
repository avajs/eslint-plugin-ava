import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-negated-assertion';

const negatedPairs = {
	true: 'falsy',
	false: 'truthy',
	truthy: 'falsy',
	falsy: 'truthy',
};

const doubleNegatedPairs = {
	true: 'truthy',
	false: 'falsy',
	truthy: 'truthy',
	falsy: 'falsy',
};

const getArgumentText = (source, argument) => argument.type === 'SequenceExpression' ? `(${source.getText(argument)})` : source.getText(argument);

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (node.callee.type !== 'MemberExpression') {
				return;
			}

			const root = util.getRootNode(node.callee);

			if (!util.isTestObject(root.object.name)) {
				return;
			}

			const members = util.getMembers(node.callee);
			const methodName = members[0];

			if (!negatedPairs[methodName]) {
				return;
			}

			if (!members.slice(1).every(member => member === 'skip')) {
				return;
			}

			const argument = node.arguments[0];

			if (!argument || argument.type !== 'UnaryExpression' || argument.operator !== '!') {
				return;
			}

			// Double negation: `t.true(!!x)` → `t.truthy(x)` to preserve behavior for non-boolean values.
			if (argument.argument.type === 'UnaryExpression' && argument.argument.operator === '!') {
				const replacement = doubleNegatedPairs[methodName];

				context.report({
					node,
					messageId: MESSAGE_ID,
					data: {
						assertion: methodName,
						replacement,
					},
					fix(fixer) {
						const source = context.sourceCode;
						return [
							fixer.replaceText(root.property, replacement),
							fixer.replaceText(argument, getArgumentText(source, argument.argument.argument)),
						];
					},
				});
				return;
			}

			const replacement = negatedPairs[methodName];

			context.report({
				node,
				messageId: MESSAGE_ID,
				data: {
					assertion: methodName,
					replacement,
				},
				fix(fixer) {
					const source = context.sourceCode;
					return [
						fixer.replaceText(root.property, replacement),
						fixer.replaceText(argument, getArgumentText(source, argument.argument)),
					];
				},
			});
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow negated assertions.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Prefer `t.{{replacement}}()` over negating the argument of `t.{{assertion}}()`.',
		},
	},
};

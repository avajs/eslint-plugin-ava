import createAvaRule, {visitIf} from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'hooks-order';

const buildOrders = names => Object.fromEntries(names.map((name, index) => [name, names.slice(index + 1)]));

const buildMessage = (name, orders, visited) => {
	const checks = orders[name];

	for (const check of checks) {
		const nodeEarlier = visited[check];
		if (nodeEarlier) {
			return {
				messageId: MESSAGE_ID,
				data: {
					current: name,
					invalid: check,
				},
				node: nodeEarlier,
			};
		}
	}

	return null;
};

const create = context => {
	const ava = createAvaRule(context.sourceCode);

	const orders = buildOrders([
		'before',
		'after',
		'after.always',
		'beforeEach',
		'afterEach',
		'afterEach.always',
		'test',
	]);

	const visited = {};

	const {sourceCode} = context;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			if (util.hasComputedTestModifier(node)) {
				return;
			}

			if (ava.hasTestModifier('macro')) {
				return;
			}

			const name = util.getHookName(node) ?? 'test';

			visited[name] = node;

			const message = buildMessage(name, orders, visited);
			if (message) {
				const nodeEarlier = message.node;

				context.report({
					node,
					messageId: message.messageId,
					data: message.data,
					fix(fixer) {
						const tokensBetween = sourceCode.getTokensBetween(nodeEarlier.parent, node.parent);

						if (tokensBetween.length > 0) {
							return;
						}

						const source = sourceCode.getText();
						let [insertStart, insertEnd] = nodeEarlier.parent.range;

						// Grab the node and all comments and whitespace before the node
						const start = nodeEarlier.parent.range[1];
						const end = node.parent.range[1];

						let text = source.slice(start, end);

						// Preserve newline previously between hooks
						if (source.length >= (start + 1) && source[start + 1] === '\n') {
							text = text.slice(1) + '\n';
						}

						// Preserve newline that was previously before hooks
						if ((insertStart - 1) > 0 && source[insertStart - 1] === '\n') {
							insertStart -= 1;
						}

						return [
							fixer.insertTextBeforeRange([insertStart, insertEnd], text),
							fixer.removeRange([start, end]),
						];
					},
				});
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Enforce test hook ordering.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID]: '`{{current}}` hook must come before `{{invalid}}`',
		},
	},
};

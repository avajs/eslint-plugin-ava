import {getStaticValue} from '@eslint-community/eslint-utils';
import createAvaRule, {visitIf} from '../create-ava-rule.js';
import util from '../util.js';

const MESSAGE_ID = 'no-skip-test';
const MESSAGE_ID_SUGGESTION = 'no-skip-test-suggestion';

// `test.skipIf(true)` and `test.runIf(false)` always skip the test
function isAlwaysSkippingModifier(modifier, sourceCode) {
	if (!util.conditionalModifiers.has(modifier.name)) {
		return false;
	}

	// `skipIf` → `test.skipIf` → `test.skipIf(condition)`
	const [condition] = modifier.parent.parent.arguments;
	if (!condition) {
		return false;
	}

	// Globals, like `Promise.withResolvers`, are evaluated with the Node.js version that runs ESLint, which can differ from the one that runs the tests
	const scope = sourceCode.getScope(condition);
	const [start, end] = condition.range;
	const usesGlobal = scope.references.some(({identifier, resolved}) => identifier.range[0] >= start
		&& identifier.range[1] <= end
		&& (resolved === null || resolved.defs.length === 0));
	if (usesGlobal) {
		return false;
	}

	const staticValue = getStaticValue(condition, scope);
	if (!staticValue) {
		return false;
	}

	return modifier.name === 'skipIf' ? Boolean(staticValue.value) : !staticValue.value;
}

const create = context => {
	const ava = createAvaRule(context.sourceCode);

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const propertyNode = util.getTestModifier(node, 'skip');
			if (propertyNode) {
				context.report({
					node: propertyNode,
					messageId: MESSAGE_ID,
					suggest: [{
						messageId: MESSAGE_ID_SUGGESTION,
						fix: fixer => fixer.replaceTextRange.apply(null, util.removeTestModifier({
							modifier: 'skip',
							node,
							context,
						})),
					}],
				});
			}

			for (const modifier of util.getTestModifiers(node)) {
				if (isAlwaysSkippingModifier(modifier, context.sourceCode)) {
					context.report({
						node: modifier,
						messageId: MESSAGE_ID,
					});
				}
			}
		}),
	});
};

export default {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow skipping tests.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			[MESSAGE_ID]: 'No tests should be skipped.',
			[MESSAGE_ID_SUGGESTION]: 'Remove the `.skip`.',
		},
		languages: ['js/js'],
	},
};

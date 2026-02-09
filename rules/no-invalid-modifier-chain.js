import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID = 'no-invalid-modifier-chain';
const SUGGESTION_MESSAGE_ID = 'no-invalid-modifier-chain-suggestion';

const validChains = new Set([
	// Tests
	'',
	'failing',
	'only',
	'serial',
	'skip',
	'failing.only',
	'failing.skip',
	'serial.failing',
	'serial.only',
	'serial.skip',
	'serial.failing.only',
	'serial.failing.skip',
	'todo',
	'serial.todo',

	// Before/beforeEach hooks
	'before',
	'before.skip',
	'beforeEach',
	'beforeEach.skip',
	'serial.before',
	'serial.before.skip',
	'serial.beforeEach',
	'serial.beforeEach.skip',

	// After/afterEach hooks (with always)
	'after',
	'after.skip',
	'after.always',
	'after.always.skip',
	'afterEach',
	'afterEach.skip',
	'afterEach.always',
	'afterEach.always.skip',
	'serial.after',
	'serial.after.skip',
	'serial.after.always',
	'serial.after.always.skip',
	'serial.afterEach',
	'serial.afterEach.skip',
	'serial.afterEach.always',
	'serial.afterEach.always.skip',

	// Special
	'macro',
]);

// Canonical order for AVA modifiers
const modifierOrder = new Map([
	['serial', 0],
	['before', 1],
	['beforeEach', 1],
	['after', 1],
	['afterEach', 1],
	['always', 2],
	['failing', 3],
	['only', 4],
	['skip', 4],
	['todo', 4],
	['macro', 5],
]);

function hasOnlyKnownModifiers(modifierNames) {
	return modifierNames.every(name => modifierOrder.has(name));
}

function getFixedChain(modifierNames) {
	if (!hasOnlyKnownModifiers(modifierNames)) {
		return undefined;
	}

	// Deduplicate and sort by canonical order
	const fixedChain = [...new Set(modifierNames)]
		.sort((a, b) => modifierOrder.get(a) - modifierOrder.get(b))
		.join('.');

	return validChains.has(fixedChain) ? fixedChain : undefined;
}

function getSuggestions(modifierNames) {
	if (!hasOnlyKnownModifiers(modifierNames)) {
		return [];
	}

	const unique = [...new Set(modifierNames)];
	const suggestions = [];

	for (const removed of unique) {
		const remaining = unique.filter(name => name !== removed);
		const chain = remaining
			.sort((a, b) => modifierOrder.get(a) - modifierOrder.get(b))
			.join('.');

		if (validChains.has(chain)) {
			suggestions.push({chain, removed});
		}
	}

	return suggestions;
}

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const testModifiers = util.getTestModifiers(node);
			const modifierNames = testModifiers.map(property => property.name);

			// Strip leading `default` modifier (CJS/ESM interop: test.default.serial() → test.serial())
			const hasDefault = modifierNames[0] === 'default';
			if (hasDefault) {
				modifierNames.shift();
			}

			const chain = modifierNames.join('.');

			if (!validChains.has(chain)) {
				const fixedChain = getFixedChain(modifierNames);
				const rootName = util.getNameOfRootNodeObject(node.callee);
				const prefix = hasDefault ? `${rootName}.default` : rootName;

				const buildCallee = c => c ? `${prefix}.${c}` : prefix;

				context.report({
					node: node.callee,
					messageId: MESSAGE_ID,
					data: {chain},
					fix: fixedChain === undefined
						? undefined
						: fixer => fixer.replaceText(node.callee, buildCallee(fixedChain)),
					suggest: fixedChain === undefined
						? getSuggestions(modifierNames).map(({chain, removed}) => ({
							messageId: SUGGESTION_MESSAGE_ID,
							data: {removed},
							fix: fixer => fixer.replaceText(node.callee, buildCallee(chain)),
						}))
						: [],
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
			description: 'Disallow invalid modifier chains.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		hasSuggestions: true,
		schema: [],
		messages: {
			[MESSAGE_ID]: 'Invalid test modifier chain `.{{chain}}`.',
			[SUGGESTION_MESSAGE_ID]: 'Remove the `.{{removed}}` modifier.',
		},
	},
};

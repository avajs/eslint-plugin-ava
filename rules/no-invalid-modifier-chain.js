import {visitIf} from 'enhance-visitors';
import {findVariable} from '@eslint-community/eslint-utils';
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

function hasNamedSerialRoot(node, sourceCode) {
	const rootObject = node.callee.type === 'MemberExpression'
		? util.getRootNode(node.callee).object
		: node.callee;

	if (rootObject.type !== 'Identifier') {
		return false;
	}

	const variable = findVariable(sourceCode.getScope(rootObject), rootObject);
	if (!variable) {
		return false;
	}

	return variable.defs.some(definition => definition.type === 'ImportBinding'
		&& definition.parent?.source?.value === 'ava'
		&& definition.node.type === 'ImportSpecifier'
		&& definition.node.imported.name === 'serial');
}

function getCalleeText(chain, prefix, hasImplicitSerial) {
	if (!hasImplicitSerial) {
		return chain ? `${prefix}.${chain}` : prefix;
	}

	if (chain === 'serial') {
		return prefix;
	}

	if (chain.startsWith('serial.')) {
		const chainWithoutRootSerial = chain.slice('serial.'.length);
		return chainWithoutRootSerial ? `${prefix}.${chainWithoutRootSerial}` : prefix;
	}

	return `${prefix}.${chain}`;
}

const create = context => {
	const ava = createAvaRule();
	const {sourceCode} = context;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
		])(node => {
			const testModifiers = util.getTestModifiers(node);
			const modifierNames = testModifiers.map(property => property.name);

			// Strip leading `default` modifier (CJS/ESM interop: test.default.serial() → test.serial())
			const hasDefault = modifierNames[0] === 'default';
			const modifiersWithoutDefault = hasDefault ? modifierNames.slice(1) : modifierNames;
			const hasImplicitSerial = hasNamedSerialRoot(node, sourceCode);
			const chainModifiers = hasImplicitSerial ? ['serial', ...modifiersWithoutDefault] : modifiersWithoutDefault;

			const chain = chainModifiers.join('.');

			if (!validChains.has(chain)) {
				const fixedChain = getFixedChain(chainModifiers);
				const rootName = util.getNameOfRootNodeObject(node.callee);
				const prefix = hasDefault ? `${rootName}.default` : rootName;

				context.report({
					node: node.callee,
					messageId: MESSAGE_ID,
					data: {chain},
					fix: fixedChain === undefined
						? undefined
						: fixer => fixer.replaceText(node.callee, getCalleeText(fixedChain, prefix, hasImplicitSerial)),
					suggest: fixedChain === undefined
						? getSuggestions(chainModifiers)
							.filter(({removed}) => !(hasImplicitSerial && removed === 'serial'))
							.map(({chain, removed}) => ({
								messageId: SUGGESTION_MESSAGE_ID,
								data: {removed},
								fix: fixer => fixer.replaceText(node.callee, getCalleeText(chain, prefix, hasImplicitSerial)),
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

import createAvaRule, {visitIf} from '../create-ava-rule.js';
import {findVariable} from '@eslint-community/eslint-utils';
import util from '../util.js';

const MESSAGE_ID_MISSING = 'test-title';
const MESSAGE_ID_NON_STRING = 'non-string-title';
const MESSAGE_ID_EMPTY = 'empty-title';
const MESSAGE_ID_WHITESPACE = 'title-whitespace';
const toStringLiteral = value => JSON.stringify(value);

function hasObjectMacroTitle(node) {
	if (node?.type !== 'ObjectExpression' || !util.getMacroExec(node)) {
		return false;
	}

	return node.properties.some(property => property.type === 'Property'
		&& !property.computed
		&& (
			(property.key.type === 'Identifier' && property.key.name === 'title')
			|| (property.key.type === 'Literal' && property.key.value === 'title')
		));
}

function hasReferencedObjectMacroTitle(node, sourceCode, currentNode, seenReferences = new Set()) {
	if (hasObjectMacroTitle(node)) {
		return true;
	}

	const referenceIdentifier = util.getReferenceIdentifier(node);
	if (!referenceIdentifier || seenReferences.has(referenceIdentifier)) {
		return false;
	}

	seenReferences.add(referenceIdentifier);

	const variable = findVariable(sourceCode.getScope(currentNode), referenceIdentifier);
	if (!variable) {
		return false;
	}

	return variable.defs.some(definition => {
		if (definition.type !== 'Variable') {
			return false;
		}

		return hasReferencedObjectMacroTitle(util.unwrapTypeExpression(definition.node.init), sourceCode, currentNode, seenReferences);
	});
}

function isImplementationWithoutTitle(firstArgument, implementationArgument, sourceCode, node) {
	if (!firstArgument || implementationArgument !== firstArgument) {
		return false;
	}

	if (util.getMacroExec(util.unwrapTypeExpression(node.arguments[1]))) {
		return false;
	}

	if (util.isFunctionExpression(firstArgument)) {
		return true;
	}

	if (hasReferencedObjectMacroTitle(firstArgument, sourceCode, node)) {
		return false;
	}

	if (util.getMacroExec(firstArgument)) {
		return true;
	}

	return firstArgument.type !== 'Literal'
		&& firstArgument.type !== 'ObjectExpression'
		&& util.isLocalImplementationReference(firstArgument, sourceCode, node);
}

const create = context => {
	const ava = createAvaRule(context.sourceCode);
	const {sourceCode} = context;

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isTestNode,
			ava.hasNoUtilityModifier,
		])(node => {
			const firstArgument = util.unwrapTypeExpression(node.arguments[0]);
			const implementationArgument = util.getTestImplementationArgument(node, sourceCode);

			if (node.arguments.length === 0 || isImplementationWithoutTitle(firstArgument, implementationArgument, sourceCode, node)) {
				context.report({
					node,
					messageId: MESSAGE_ID_MISSING,
				});
				return;
			}

			if (firstArgument.type === 'Literal' && typeof firstArgument.value !== 'string') {
				context.report({
					node: firstArgument,
					messageId: MESSAGE_ID_NON_STRING,
				});
				return;
			}

			const titleValue = util.getStringValue(firstArgument);
			if (titleValue === undefined) {
				return;
			}

			if (titleValue.trim() === '') {
				context.report({
					node: firstArgument,
					messageId: MESSAGE_ID_EMPTY,
				});
				return;
			}

			if (titleValue !== titleValue.trim()) {
				const trimmedTitle = titleValue.trim();
				context.report({
					node: firstArgument,
					messageId: MESSAGE_ID_WHITESPACE,
					fix(fixer) {
						return fixer.replaceText(firstArgument, toStringLiteral(trimmedTitle));
					},
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
			description: 'Require tests to have a title.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID_MISSING]: 'Test should have a title.',
			[MESSAGE_ID_NON_STRING]: 'Test title must be a string.',
			[MESSAGE_ID_EMPTY]: 'Test title must not be empty.',
			[MESSAGE_ID_WHITESPACE]: 'Test title must not have leading or trailing whitespace.',
		},
	},
};

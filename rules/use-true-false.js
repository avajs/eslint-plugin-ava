import {isDeepStrictEqual} from 'node:util';
import * as espree from 'espree';
import espurify from 'espurify';
import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID_TRUE = 'use-true';
const MESSAGE_ID_FALSE = 'use-false';
const MESSAGE_ID_IS_TRUE = 'use-true-over-is';
const MESSAGE_ID_IS_FALSE = 'use-false-over-is';

const booleanBinaryOperators = new Set([
	'==',
	'===',
	'!=',
	'!==',
	'<',
	'<=',
	'>',
	'>=',
	'in',
	'instanceof',
]);

const knownBooleanSignatures = [
	'isFinite()',
	'isNaN()',
	'Object.is()',
	'Object.isExtensible()',
	'Object.isFrozen()',
	'Object.isSealed()',
	'Object.hasOwn()',
	'Boolean()',
	'Number.isNaN()',
	'Number.isFinite()',
	'Number.isInteger()',
	'Number.isSafeInteger()',
	'Array.isArray()',
	'ArrayBuffer.isView()',
	'SharedArrayBuffer.isView()',
	'Reflect.has()',
	'Reflect.isExtensible()',
	'Reflect.preventExtensions()',
	'Reflect.defineProperty()',
	'Reflect.deleteProperty()',
	'Reflect.set()',
	'Reflect.setPrototypeOf()',
].map(signature => espurify(espree.parse(signature, {ecmaVersion: 'latest'}).body[0].expression.callee));

function matchesKnownBooleanExpression(argument) {
	if (argument.type !== 'CallExpression') {
		return false;
	}

	const callee = espurify(argument.callee);

	return knownBooleanSignatures.some(signature => isDeepStrictEqual(callee, signature));
}

const create = context => {
	const ava = createAvaRule(context.sourceCode);

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (
				node.callee.type !== 'MemberExpression'
			) {
				return;
			}

			const root = util.getRootNode(node.callee);
			if (
				root.object.type !== 'Identifier'
				|| !util.isTestObject(root.object.name)
			) {
				return;
			}

			const name = util.getAssertionName(node.callee);
			if (!name) {
				return;
			}

			if (name === 'assert' || name === 'truthy' || name === 'falsy') {
				const argument = node.arguments[0];

				if (argument
					&& ((argument.type === 'BinaryExpression' && booleanBinaryOperators.has(argument.operator))
						|| (argument.type === 'UnaryExpression' && argument.operator === '!')
						|| (argument.type === 'Literal' && argument.value === Boolean(argument.value))
						|| (matchesKnownBooleanExpression(argument)))
				) {
					const isFalsy = name === 'falsy';
					context.report({
						node,
						messageId: isFalsy ? MESSAGE_ID_FALSE : MESSAGE_ID_TRUE,
						data: {method: name},
						fix(fixer) {
							return fixer.replaceText(root.property, isFalsy ? 'false' : 'true');
						},
					});
				}

				return;
			}

			if (name === 'is') {
				const [first, second, message] = node.arguments;

				if (!first || !second) {
					return;
				}

				const firstIsBoolean = first.type === 'Literal' && typeof first.value === 'boolean';
				const secondIsBoolean = second.type === 'Literal' && typeof second.value === 'boolean';

				// Skip if neither or both are boolean literals
				if (firstIsBoolean === secondIsBoolean) {
					return;
				}

				const booleanLiteral = firstIsBoolean ? first : second;
				const otherArgument = firstIsBoolean ? second : first;
				const assertion = booleanLiteral.value ? 'true' : 'false';
				const messageId = booleanLiteral.value ? MESSAGE_ID_IS_TRUE : MESSAGE_ID_IS_FALSE;

				context.report({
					node,
					messageId,
					fix(fixer) {
						const source = context.sourceCode;
						const newArguments = message
							? `${source.getText(otherArgument)}, ${source.getText(message)}`
							: source.getText(otherArgument);

						return [
							fixer.replaceText(root.property, assertion),
							fixer.replaceTextRange(
								[first.range[0], node.arguments.at(-1).range[1]],
								newArguments,
							),
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
			description: 'Prefer `t.true()`/`t.false()` over `t.truthy()`/`t.falsy()`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID_TRUE]: '`t.true()` should be used instead of `t.{{method}}()`.',
			[MESSAGE_ID_FALSE]: '`t.false()` should be used instead of `t.{{method}}()`.',
			[MESSAGE_ID_IS_TRUE]: 'Prefer `t.true()` over `t.is(…, true)`.',
			[MESSAGE_ID_IS_FALSE]: 'Prefer `t.false()` over `t.is(…, false)`.',
		},
	},
};

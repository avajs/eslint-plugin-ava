import {isDeepStrictEqual} from 'node:util';
import * as espree from 'espree';
import espurify from 'espurify';
import {visitIf} from 'enhance-visitors';
import util from '../util.js';
import createAvaRule from '../create-ava-rule.js';

const MESSAGE_ID_TRUE = 'use-true';
const MESSAGE_ID_FALSE = 'use-false';

const booleanBinaryOperators = new Set([
	'==',
	'===',
	'!=',
	'!==',
	'<',
	'<=',
	'>',
	'>=',
]);

const knownBooleanSignatures = [
	'isFinite()',
	'isNaN()',
	'Object.is()',
	'Object.isExtensible()',
	'Object.isFrozen()',
	'Object.isSealed()',
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
].map(signature => espurify(espree.parse(signature).body[0].expression.callee));

function matchesKnownBooleanExpression(argument) {
	if (argument.type !== 'CallExpression') {
		return false;
	}

	const callee = espurify(argument.callee);

	return knownBooleanSignatures.some(signature => isDeepStrictEqual(callee, signature));
}

const create = context => {
	const ava = createAvaRule();

	return ava.merge({
		CallExpression: visitIf([
			ava.isInTestFile,
			ava.isInTestNode,
		])(node => {
			if (
				node.callee.type === 'MemberExpression'
				&& (node.callee.property.name === 'truthy' || node.callee.property.name === 'falsy')
				&& node.callee.object.name === 't'
			) {
				const argument = node.arguments[0];

				if (argument
					&& ((argument.type === 'BinaryExpression' && booleanBinaryOperators.has(argument.operator))
						|| (argument.type === 'UnaryExpression' && argument.operator === '!')
						|| (argument.type === 'Literal' && argument.value === Boolean(argument.value))
						|| (matchesKnownBooleanExpression(argument)))
				) {
					const isFalsy = node.callee.property.name === 'falsy';
					context.report({
						node,
						messageId: isFalsy ? MESSAGE_ID_FALSE : MESSAGE_ID_TRUE,
						fix(fixer) {
							return fixer.replaceText(node.callee.property, isFalsy ? 'false' : 'true');
						},
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
			description: 'Prefer `t.true()`/`t.false()` over `t.truthy()`/`t.falsy()`.',
			recommended: true,
			url: util.getDocsUrl(import.meta.filename),
		},
		fixable: 'code',
		schema: [],
		messages: {
			[MESSAGE_ID_TRUE]: '`t.true()` should be used instead of `t.truthy()`.',
			[MESSAGE_ID_FALSE]: '`t.false()` should be used instead of `t.falsy()`.',
		},
	},
};

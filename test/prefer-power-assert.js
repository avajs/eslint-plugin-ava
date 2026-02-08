import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/prefer-power-assert.js';

const ruleTester = new RuleTester();

const errors = [{messageId: 'prefer-power-assert'}];

function testNotAllowedMethod(methodName) {
	ruleTester.run(`prefer-power-assert - not allowed: ${methodName}`, rule, {
		valid: [],
		invalid: [
			{
				name: `[not allowed: ${methodName}] t.${methodName}`,
				code: `test(t => { t.${methodName}; });`,
				errors,
			},
			{
				name: `[not allowed: ${methodName}] t.skip.${methodName}`,
				code: `test(t => { t.skip.${methodName}; });`,
				errors,
			},
		],
	});
}

const notAllowedMethods = [
	'truthy(foo)',
	'falsy(foo)',
	'true(foo)',
	'false(foo)',
	'is(foo, bar)',
	'not(foo, bar)',
	'regex(str, re)',
	'notRegex(str, re)',
	'ifError(err)',
];

for (const methodName of notAllowedMethods) {
	testNotAllowedMethod(methodName);
}

function testAllowedMethod(methodName) {
	ruleTester.run(`prefer-power-assert - allowed: ${methodName}`, rule, {
		valid: [
			{
				name: `[allowed: ${methodName}] t.${methodName}`,
				code: `test(t => { t.${methodName}; });`,
			},
			{
				name: `[allowed: ${methodName}] t.skip.${methodName}`,
				code: `test(t => { t.skip.${methodName}; });`,
			},
		],
		invalid: [],
	});
}

const allowedMethods = [
	'assert(foo)',
	'deepEqual(foo, bar)',
	'notDeepEqual(foo, bar)',
	'like(foo, bar)',
	'throws(block)',
	'notThrows(block)',
	'pass(foo)',
	'fail(foo)',
];

for (const methodName of allowedMethods) {
	testAllowedMethod(methodName);
}

function testWithModifier(modifier) {
	ruleTester.run(`prefer-power-assert - modifier: ${modifier}`, rule, {
		valid: [
			{
				name: `[modifier: ${modifier}] t.assert(foo)`,
				code: `test.${modifier}(t => { t.assert(foo); });`,
			},
		],
		invalid: [
			{
				name: `[modifier: ${modifier}] t.is(foo)`,
				code: `test.${modifier}(t => { t.is(foo); });`,
				errors,
			},
		],
	});
}

for (const modifiers of ['skip', 'only', 'serial']) {
	testWithModifier(modifiers);
}

function testDeclaration(declaration) {
	ruleTester.run(`prefer-power-assert - declaration: ${declaration}`, rule, {
		valid: [
			{
				name: `[declaration] ${declaration} t.assert(foo)`,
				noHeader: true,
				code: `${declaration}\n test(t => { t.assert(foo); });`,
			},
		],
		invalid: [
			{
				name: `[declaration] ${declaration} t.is(foo)`,
				noHeader: true,
				code: `${declaration}\n test(t => { t.is(foo); });`,
				errors,
			},
		],
	});
}

for (const declaration of [
	'var test = require(\'ava\');',
	'let test = require(\'ava\');',
	'const test = require(\'ava\');',
	'import test from \'ava\';',
]) {
	testDeclaration(declaration);
}

const assertionInNestedCode = `
test(t => {
	const foo = () => {
		t.is('foo', 'bar');
	};
	foo();
});
`;

ruleTester.run('prefer-power-assert - nested', rule, {
	valid: [
		{
			name: '[nested] function expression',
			code: 'test(function (t) { t.assert(foo); });',
		},
		// Shouldn't be triggered since it's not a test file
		{
			name: '[nested] not a test file',
			noHeader: true,
			code: 'test(t => {});',
		},
	],
	invalid: [
		{
			code: assertionInNestedCode,
			errors,
		},
		// Alternative test object names for t.try() callbacks
		{
			name: '[nested] alternative test object name',
			code: 'test(t => { tt.is(foo); });',
			errors,
		},
	],
});

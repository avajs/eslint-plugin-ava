import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/prefer-power-assert.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
});

const errors = [{message: 'Only asserts with no power-assert alternative are allowed.'}];

function testNotAllowedMethod(methodName) {
	ruleTester.run(`prefer-power-assert - not allowed: ${methodName}`, rule, {
		assertionOptions: {
			requireMessage: true,
		},
		valid: [],
		invalid: [
			{
				name: `[not allowed: ${methodName}] t.${methodName}`,
				code: `import test from 'ava';\n test(t => { t.${methodName}; });`,
				errors,
			},
			{
				name: `[not allowed: ${methodName}] t.skip.${methodName}`,
				code: `import test from 'ava';\n test(t => { t.skip.${methodName}; });`,
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
		assertionOptions: {
			requireMessage: true,
		},
		valid: [
			{
				name: `[allowed: ${methodName}] t.${methodName}`,
				code: `import test from 'ava';\n test(t => { t.${methodName}; });`,
			},
			{
				name: `[allowed: ${methodName}] t.skip.${methodName}`,
				code: `import test from 'ava';\n test(t => { t.skip.${methodName}; });`,
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
		assertionOptions: {
			requireMessage: true,
		},
		valid: [
			{
				name: `[modifier: ${modifier}] t.assert(foo)`,
				code: `import test from 'ava';\n test.${modifier}(t => { t.assert(foo); });`,
			},
		],
		invalid: [
			{
				name: `[modifier: ${modifier}] t.is(foo)`,
				code: `import test from 'ava';\n test.${modifier}(t => { t.is(foo); });`,
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
		assertionOptions: {
			requireMessage: true,
		},
		valid: [
			{
				name: `[declaration] ${declaration} t.assert(foo)`,
				code: `${declaration}\n test(t => { t.assert(foo); });`,
			},
		],
		invalid: [
			{
				name: `[declaration] ${declaration} t.is(foo)`,
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
import test from 'ava';

test(t => {
	const foo = () => {
		t.is('foo', 'bar');
	};
	foo();
});
`;

ruleTester.run('prefer-power-assert - nested', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		{
			name: '[nested] function expression',
			code: 'import test from \'ava\';\n test(function (t) { t.assert(foo); });',
		},
		// Shouldn't be triggered since it's not a test file
		{
			name: '[nested] not a test file',
			code: 'test(t => {});',
		},
	],
	invalid: [
		{
			code: assertionInNestedCode,
			errors,
		},
	],
});

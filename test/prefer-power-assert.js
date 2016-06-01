import test from 'ava';
import {RuleTester} from 'eslint';
import {permutationCombination} from 'js-combinatorics';
import rule from '../rules/prefer-power-assert';

const ruleTester = new RuleTester({
	env: {
		es6: true
	},
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module'
	}
});

const errors = [{ruleId: 'prefer-power-assert'}];

function testNotAllowedMethod(methodName) {
	test(`${methodName} is not allowed`, () => {
		ruleTester.run('prefer-power-assert', rule, {
			valid: [],
			invalid: [
				{
					code: `import test from 'ava';\n test(t => { t.${methodName}; });`,
					errors
				},
				{
					code: `import test from 'ava';\n test(t => { t.skip.${methodName}; });`,
					errors
				}
			]
		});
	});
}

const notAllowedMethods = [
	'truthy(foo)',
	'falsy(foo)',
	'false(foo)',
	'is(foo, bar)',
	'not(foo, bar)',
	'regex(str, re)',
	'notRegex(str, re)',
	'ifError(err)'
];

for (const methodName of notAllowedMethods) {
	testNotAllowedMethod(methodName);
}

function testAllowedMethod(methodName) {
	test(`${methodName} is allowed`, () => {
		ruleTester.run('prefer-power-assert', rule, {
			valid: [
				{
					code: `import test from 'ava';\n test(t => { t.${methodName}; });`
				},
				{
					code: `import test from 'ava';\n test(t => { t.skip.${methodName}; });`
				}
			],
			invalid: []
		});
	});
}

const allowedMethods = [
	'true(foo)',
	'deepEqual(foo, bar)',
	'notDeepEqual(foo, bar)',
	'throws(block)',
	'notThrows(block)',
	'pass(foo)',
	'fail(foo)'
];

for (const methodName of allowedMethods) {
	testAllowedMethod(methodName);
}

function testWithModifier(modifier) {
	test(`with modifier test.${modifier}`, () => {
		ruleTester.run('prefer-power-assert', rule, {
			valid: [
				{
					code: `import test from 'ava';\n test.${modifier}(t => { t.true(foo); });`
				}
			],
			invalid: [
				{
					code: `import test from 'ava';\n test.${modifier}(t => { t.is(foo); });`,
					errors
				}
			]
		});
	});
}

for (const modifiers of permutationCombination(['skip', 'only', 'cb', 'serial']).toArray()) {
	testWithModifier(modifiers.join('.'));
}

function testDeclaration(declaration) {
	test(`with ava declaration ${declaration}`, () => {
		ruleTester.run('prefer-power-assert', rule, {
			valid: [
				{
					code: `${declaration}\n test(t => { t.true(foo); });`
				}
			],
			invalid: [
				{
					code: `${declaration}\n test(t => { t.is(foo); });`,
					errors
				}
			]
		});
	});
}

for (const declaration of [
	`var test = require('ava');`,
	`let test = require('ava');`,
	`const test = require('ava');`,
	`import test from 'ava';`
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

test('assertion in nested code', () => {
	ruleTester.run('prefer-power-assert', rule, {
		valid: [
		],
		invalid: [
			{
				code: assertionInNestedCode,
				errors
			}
		]
	});
});

test('misc', () => {
	ruleTester.run('prefer-power-assert', rule, {
		valid: [
			{
				code: `import test from 'ava';\n test.cb(function (t) { t.true(foo); t.end(); });`
			},
			// shouldn't be triggered since it's not a test file
			{
				code: 'test(t => {});'
			}
		],
		invalid: []
	});
});

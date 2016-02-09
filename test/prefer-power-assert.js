import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/prefer-power-assert';

const ruleTester = new RuleTester({
	env: {
		es6: true
	},
	ecmaFeatures: {
		modules: true
	}
});

const errors = [{ruleId: 'prefer-power-assert'}];

function testNotAllowedMethod(methodName) {
	test(`${methodName} is not allowed`, () => {
		ruleTester.run('prefer-power-assert', rule, {
			valid: [
			],
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
	'notOk(foo)',
	'true(foo)',
	'false(foo)',
	'is(foo, bar)',
	'not(foo, bar)',
	'regex(str, re)',
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
			invalid: [
			]
		});
	});
}
const allowedMethods = [
	'ok(foo)',
	'same(foo, bar)',
	'notSame(foo, bar)',
	'throws(block)',
	'notThrows(block)'
];
for (const methodName of allowedMethods) {
	testAllowedMethod(methodName);
}

function testWithModifier(modifier) {
	test(`with modifier test.${modifier}`, () => {
		ruleTester.run('prefer-power-assert', rule, {
			valid: [
				{
					code: `import test from 'ava';\n test.${modifier}(t => { t.ok(foo); });`
				}
			],
			invalid: [
				{
					code: `import test from 'ava';\n test.${modifier}(t => { t.notOk(foo); });`,
					errors
				}
			]
		});
	});
}
for (const mod1 of ['skip', 'only']) {
	for (const mod2 of ['cb', 'serial']) {
		testWithModifier(mod1);
		testWithModifier(mod2);
		testWithModifier(`${mod1}.${mod2}`);
		testWithModifier(`${mod2}.${mod1}`);
	}
}

function testDeclaration(declaration) {
	test(`with ava declaration ${declaration}`, () => {
		ruleTester.run('prefer-power-assert', rule, {
			valid: [
				{
					code: `${declaration}\n test(t => { t.ok(foo); });`
				}
			],
			invalid: [
				{
					code: `${declaration}\n test(t => { t.notOk(foo); });`,
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

test(`misc`, () => {
	ruleTester.run('prefer-power-assert', rule, {
		valid: [
			{
				code: `import test from 'ava';\n test.cb(function (t) { t.ok(foo); t.end(); });`
			},
			// shouldn't be triggered since it's not a test file
			{
				code: 'test(t => {});'
			}
		],
		invalid: [
		]
	});
});

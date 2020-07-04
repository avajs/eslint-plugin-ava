const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/test-title-format');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'test-title-format'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('test-title-format', rule, {
	valid: [
		header + 'test("Foo", t => { t.pass(); });',
		{
			code: header + 'test("Foo", t => { t.pass(); });',
			options: [{format: '.'}]
		},
		{
			code: header + 'test("Should pass tests.", t => { t.pass(); });',
			options: [{format: '^Should .+\\.$'}]
		},
		{
			code: header + 'test.todo("Should pass tests.");',
			options: [{format: '^Should .+\\.$'}]
		},
		{
			code: header + 'test(t => { t.pass(); });',
			options: [{format: '^Should'}]
		},
		{
			code: header + 'notTest("Foo", t => { t.pass(); });',
			options: [{format: '^Should'}]
		},
		{
			code: header + 'test(macro, t => { t.pass(); });',
			options: [{format: '^Should'}]
		},
		// Shouldn't be triggered since it's not a test file
		{
			code: 'test("Test", t => { t.pass(); });',
			options: [{format: '^Should'}]
		}
	],
	invalid: [
		{
			code: header + 'test("Test something", t => { t.pass(); });',
			options: [{format: '^Should'}],
			errors
		},
		{
			code: header + 'test.todo("Test something");',
			options: [{format: '^Should'}],
			errors
		}
	]
});

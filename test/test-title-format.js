import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/test-title-format.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const errors = [{message: 'The test title doesn\'t match the required format: `/^Should/`.'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('test-title-format', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test("Foo", t => { t.pass(); });',
		{
			code: header + 'test("Foo", t => { t.pass(); });',
			options: [{format: '.'}],
		},
		{
			code: header + 'test("Should pass tests.", t => { t.pass(); });',
			options: [{format: String.raw`^Should .+\.$`}],
		},
		{
			code: header + 'test.todo("Should pass tests.");',
			options: [{format: String.raw`^Should .+\.$`}],
		},
		{
			code: header + 'test(t => { t.pass(); });',
			options: [{format: '^Should'}],
		},
		{
			code: header + 'notTest("Foo", t => { t.pass(); });',
			options: [{format: '^Should'}],
		},
		{
			code: header + 'test(macro, t => { t.pass(); });',
			options: [{format: '^Should'}],
		},
		// Shouldn't be triggered since it's not a test file
		{
			code: 'test("Test", t => { t.pass(); });',
			options: [{format: '^Should'}],
		},
	],
	invalid: [
		{
			code: header + 'test("Test something", t => { t.pass(); });',
			options: [{format: '^Should'}],
			errors,
		},
		{
			code: header + 'test.todo("Test something");',
			options: [{format: '^Should'}],
			errors,
		},
	],
});

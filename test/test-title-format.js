import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/test-title-format.js';

const ruleTester = new RuleTester();

const errors = [{messageId: 'test-title-format'}];

ruleTester.run('test-title-format', rule, {
	valid: [
		'test("Foo", t => { t.pass(); });',
		{
			code: 'test("Foo", t => { t.pass(); });',
			options: [{format: '.'}],
		},
		{
			code: 'test("Should pass tests.", t => { t.pass(); });',
			options: [{format: String.raw`^Should .+\.$`}],
		},
		{
			code: 'test.todo("Should pass tests.");',
			options: [{format: String.raw`^Should .+\.$`}],
		},
		{
			code: 'test(t => { t.pass(); });',
			options: [{format: '^Should'}],
		},
		{
			code: 'notTest("Foo", t => { t.pass(); });',
			options: [{format: '^Should'}],
		},
		{
			code: 'test(macro, t => { t.pass(); });',
			options: [{format: '^Should'}],
		},
		// Shouldn't be triggered since it's not a test file
		{
			code: 'test("Test", t => { t.pass(); });',
			options: [{format: '^Should'}],
			noHeader: true,
		},
	],
	invalid: [
		{
			code: 'test("Test something", t => { t.pass(); });',
			options: [{format: '^Should'}],
			errors,
		},
		{
			code: 'test.todo("Test something");',
			options: [{format: '^Should'}],
			errors,
		},
	],
});

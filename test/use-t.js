import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/use-t.js';

const ruleTester = new RuleTester();

const parameterNotNamedTErrors = [{
	messageId: 'use-t',
}];

ruleTester.run('use-t', rule, {
	valid: [
		'test();',
		'test(() => {});',
		'test(t => {});',
		'test("test name", t => {});',
		'test((t, foo) => {});',
		'test(function (t) {});',
		'test(testFunction);',
		'test.macro(testFunction);',
		'test.macro(t => {});',
		'test.macro({exec: t => {}, title: () => "title"});',
		'test.todo("test name");',
		// Shouldn't be triggered since it's not a test file
		{code: 'test(foo => {});', noHeader: true},
		'test(macro, arg1, (p1) => {})',
		'test("name", macro, arg1, (p1) => {})',
		'test("name", macro, (p1) => {})',
	],
	invalid: [
		{
			code: 'test(foo => {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test("test name", foo => {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test(function (foo) {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test.macro(function (foo) {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: 'test.macro({ exec(foo) {} });',
			errors: parameterNotNamedTErrors,
		},
	],
});

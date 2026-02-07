import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/use-t.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
});

const parameterNotNamedTErrors = [{
	messageId: 'use-t',
}];

const header = 'const test = require(\'ava\');\n';

ruleTester.run('use-t', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test();',
		header + 'test(() => {});',
		header + 'test(t => {});',
		header + 'test("test name", t => {});',
		header + 'test((t, foo) => {});',
		header + 'test(function (t) {});',
		header + 'test(testFunction);',
		header + 'test.macro(testFunction);',
		header + 'test.macro(t => {});',
		header + 'test.macro({exec: t => {}, title: () => "title"});',
		header + 'test.todo("test name");',
		// Shouldn't be triggered since it's not a test file
		'test(foo => {});',
		header + 'test(macro, arg1, (p1) => {})',
		header + 'test("name", macro, arg1, (p1) => {})',
		header + 'test("name", macro, (p1) => {})',
	],
	invalid: [
		{
			code: header + 'test(foo => {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: header + 'test("test name", foo => {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: header + 'test(function (foo) {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: header + 'test.macro(function (foo) {});',
			errors: parameterNotNamedTErrors,
		},
		{
			code: header + 'test.macro({ exec(foo) {} });',
			errors: parameterNotNamedTErrors,
		},
	],
});

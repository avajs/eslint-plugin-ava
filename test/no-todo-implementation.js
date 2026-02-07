import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-todo-implementation.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const errors = [{
	messageId: 'no-todo-implementation',
}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-todo-implementation', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test(t => {});',
		header + 'test("title", t => {});',
		header + 'test.todo("title");',
		header + 'notTest.todo(t => {});',
		// Shouldn't be triggered since it's not a test file
		'test.todo("title", t => {});',
	],
	invalid: [
		{
			code: header + 'test.todo("title", t => {});',
			errors,
		},
		{
			code: header + 'test.todo(t => {});',
			errors,
		},
		{
			code: header + 'test.todo("title", function (t) {});',
			errors,
		},
		{
			code: header + 'test.todo(function (t) {});',
			errors,
		},
		{
			code: header + 'test.todo("title", function foo(t) {});',
			errors,
		},
		{
			code: header + 'test.todo(function foo(t) {});',
			errors,
		},
	],
});

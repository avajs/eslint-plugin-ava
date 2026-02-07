import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-todo-implementation.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

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
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: header + 'test("title", t => {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: header + 'test.todo("title");',
					},
				],
			}],
		},
		{
			code: header + 'test.todo(t => {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: header + 'test(t => {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: header + 'test.todo();',
					},
				],
			}],
		},
		{
			code: header + 'test.todo("title", function (t) {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: header + 'test("title", function (t) {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: header + 'test.todo("title");',
					},
				],
			}],
		},
		{
			code: header + 'test.todo(function (t) {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: header + 'test(function (t) {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: header + 'test.todo();',
					},
				],
			}],
		},
		{
			code: header + 'test.todo("title", function foo(t) {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: header + 'test("title", function foo(t) {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: header + 'test.todo("title");',
					},
				],
			}],
		},
		{
			code: header + 'test.todo(function foo(t) {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: header + 'test(function foo(t) {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: header + 'test.todo();',
					},
				],
			}],
		},
	],
});

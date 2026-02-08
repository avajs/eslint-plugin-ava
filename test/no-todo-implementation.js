import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-todo-implementation.js';

const ruleTester = new RuleTester();

ruleTester.run('no-todo-implementation', rule, {
	valid: [
		'test(t => {});',
		'test("title", t => {});',
		'test.todo("title");',
		'notTest.todo(t => {});',
		// Shouldn't be triggered since it's not a test file
		{code: 'test.todo("title", t => {});', noHeader: true},
	],
	invalid: [
		{
			code: 'test.todo("title", t => {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test("title", t => {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: 'test.todo("title");',
					},
				],
			}],
		},
		{
			code: 'test.todo(t => {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test(t => {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: 'test.todo();',
					},
				],
			}],
		},
		{
			code: 'test.todo("title", function (t) {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test("title", function (t) {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: 'test.todo("title");',
					},
				],
			}],
		},
		{
			code: 'test.todo(function (t) {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test(function (t) {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: 'test.todo();',
					},
				],
			}],
		},
		{
			code: 'test.todo("title", function foo(t) {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test("title", function foo(t) {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: 'test.todo("title");',
					},
				],
			}],
		},
		{
			code: 'test.todo(function foo(t) {});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test(function foo(t) {});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: 'test.todo();',
					},
				],
			}],
		},
	],
});

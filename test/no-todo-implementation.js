import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-todo-implementation.js';

const ruleTester = new RuleTester();

ruleTester.run('no-todo-implementation', rule, {
	valid: [
		'test(t => {});',
		'test("title", t => {});',
		'test.todo("title");',
		'import title from "./title.js"; test.todo(title);',
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
				],
			}],
		},
		{
			code: 'test.todo("title", {exec(t) {}});',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test("title", {exec(t) {}});',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: 'test.todo("title");',
					},
				],
			}],
		},
		{
			code: 'const implementation = t => {}; test.todo("title", implementation);',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'const implementation = t => {}; test("title", implementation);',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: 'const implementation = t => {}; test.todo("title");',
					},
				],
			}],
		},
		{
			code: 'const implementation = {exec(t) {}}; test.todo("title", implementation);',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'const implementation = {exec(t) {}}; test("title", implementation);',
					},
					{
						messageId: 'no-todo-implementation-remove-implementation',
						output: 'const implementation = {exec(t) {}}; test.todo("title");',
					},
				],
			}],
		},
		// Implementation as first argument with data following (inline object macro)
		{
			code: 'test.todo({exec(t) {}}, 1);',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test({exec(t) {}}, 1);',
					},
				],
			}],
		},
		// Implementation as first argument with data following (inline function)
		{
			code: 'test.todo(t => {}, 1);',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test(t => {}, 1);',
					},
				],
			}],
		},
		// Referenced implementation as first argument with data following
		{
			code: 'const impl = t => {}; test.todo(impl, 1);',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'const impl = t => {}; test(impl, 1);',
					},
				],
			}],
		},
		// Implementation as first argument with multiple trailing data args
		{
			code: 'test.todo(t => {}, 1, 2);',
			errors: [{
				messageId: 'no-todo-implementation',
				suggestions: [
					{
						messageId: 'no-todo-implementation-remove-todo',
						output: 'test(t => {}, 1, 2);',
					},
				],
			}],
		},
	],
});

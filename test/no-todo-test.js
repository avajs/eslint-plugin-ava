import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/no-todo-test';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-todo-test'}];
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('no-todo-test', rule, {
		valid: [
			header + 'test("my test name", t => { t.pass(); });',
			header + 'test.only("my test name", t => { t.pass(); });',
			header + 'notTest.todo(t => { t.pass(); });',
			// shouldn't be triggered since it's not a test file
			'test.todo("my test name");'
		],
		invalid: [
			{
				code: header + 'test.todo("my test name");',
				errors
			},
			{
				code: header + 'test.todo.cb("my test name");',
				errors
			},
			{
				code: header + 'test.cb.todo("my test name");',
				errors
			}
		]
	});
});

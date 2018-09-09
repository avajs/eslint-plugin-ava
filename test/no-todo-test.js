import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-todo-test';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-todo-test'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-todo-test', rule, {
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + 'test.only("my test name", t => { t.pass(); });',
		header + 'notTest.todo(t => { t.pass(); });',
		// Shouldn't be triggered since it's not a test file
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

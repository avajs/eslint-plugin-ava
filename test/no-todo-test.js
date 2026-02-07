import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-todo-test.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const errors = [{message: '`test.todo()` should not be used.'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-todo-test', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + 'test.only("my test name", t => { t.pass(); });',
		header + 'notTest.todo(t => { t.pass(); });',
		// Shouldn't be triggered since it's not a test file
		'test.todo("my test name");',
	],
	invalid: [
		{
			code: header + 'test.todo("my test name");',
			errors,
		},
	],
});

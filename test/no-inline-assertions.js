import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-inline-assertions';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-inline-assertions'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-todo-test', rule, {
	valid: [
		// Shouldn't be treiggered as the test implementation is not an inline arrow function
		header + 'test("my test name", t => {\n t.true(fn()); \n});',
		header + 'test("my test name", function(t) { foo(); });',
		// Shouldn't be triggered since test body is empty
		header + 'test("my test name", () => {});',
		header + 'test("my test name", (t) => {});',
		// Shouldn't be triggered since test body is ill-defined
		header + 'test("my test name", (t) => "foo");',
		// Shouldn't be triggered since it's not a test file
		'test.todo("my test name");',
		// Shouldn't be triggered since the signature is incorrect
		header + 'test.todo("my test name", "bar");',
		header + 'test.todo("my test name", undefined, t => {})'
	],
	invalid: [
		{
			code: header + 'test("my test name", t => t.skip());',
			errors
		},
		{
			code: header + 'test("my test name", t => t.true(fn()));',
			errors
		},
		{
			code: header + 'test("my test name", t => \n t.true(fn()));',
			errors
		}
	]
});

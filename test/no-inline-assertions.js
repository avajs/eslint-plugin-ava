const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/no-inline-assertions');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-inline-assertions'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-todo-test', rule, {
	valid: [
		// Shouldn't be triggered as the test implementation is not an inline arrow function
		header + 'test("my test name", t => {\n t.true(fn()); \n});',
		header + 'test("my test name", function (t) { foo(); });',
		// Shouldn't be triggered since test body is empty
		header + 'test("my test name", () => {});',
		header + 'test("my test name", t => {});',
		// Shouldn't be triggered since test body is ill-defined
		header + 'test("my test name", t => "foo");',
		// Shouldn't be triggered since it's not a test file
		'test.todo("my test name");',
		// Shouldn't be triggered since the signature is incorrect
		header + 'test.todo("my test name", "bar");',
		header + 'test.todo("my test name", undefined, t => {})'
	],
	invalid: [
		{
			code: header + 'test("my test name", t => t.skip());',
			errors,
			output: header + 'test("my test name", t => {t.skip()});'
		},
		{
			code: header + 'test("my test name", t => t.true(fn()));',
			errors,
			output: header + 'test("my test name", t => {t.true(fn())});'
		},
		{
			code: header + 'test("my test name", t => \n t.true(fn()));',
			errors,
			output: header + 'test("my test name", t => \n {t.true(fn())});'
		}
	]
});

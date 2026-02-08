import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-inline-assertions.js';

const ruleTester = new RuleTester();

const errors = [{messageId: 'no-inline-assertions'}];

ruleTester.run('no-inline-assertions', rule, {
	valid: [
		// Shouldn't be triggered as the test implementation is not an inline arrow function
		'test("my test name", t => {\n t.true(fn()); \n});',
		'test("my test name", function (t) { foo(); });',
		// Shouldn't be triggered since test body is empty
		'test("my test name", () => {});',
		'test("my test name", t => {});',
		// Shouldn't be triggered since test body is ill-defined
		'test("my test name", t => "foo");',
		// Shouldn't be triggered since it's not a test file
		{code: 'test.todo("my test name");', noHeader: true},
		// Shouldn't be triggered since the signature is incorrect
		'test.todo("my test name", "bar");',
		'test.todo("my test name", undefined, t => {})',
	],
	invalid: [
		{
			code: 'test("my test name", t => t.skip());',
			errors,
			output: 'test("my test name", t => {t.skip()});',
		},
		{
			code: 'test("my test name", t => t.true(fn()));',
			errors,
			output: 'test("my test name", t => {t.true(fn())});',
		},
		{
			code: 'test("my test name", t => \n t.true(fn()));',
			errors,
			output: 'test("my test name", t => \n {t.true(fn())});',
		},
	],
});

import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/test-title';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'test-title'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('test-title', rule, {
	valid: [
		header + 'test("my test name", t => { t.pass(); t.end(); });',
		header + 'test(`my test name`, t => { t.pass(); t.end(); });',
		header + 'test(\'my test name\', t => { t.pass(); t.end(); });',
		header + 'test.cb("my test name", t => { t.pass(); t.end(); });',
		header + 'test.todo("my test name");',
		header + 'test.before(t => {});',
		header + 'test.after(t => {});',
		header + 'test.beforeEach(t => {});',
		header + 'test.afterEach(t => {});',
		header + 'test.cb.before(t => {}); test.before.cb(t => {});',
		header + 'notTest(t => { t.pass(); t.end(); });',
		header + 'test([], arg1, arg2);',
		header + 'test({}, arg1, arg2);',
		// Shouldn't be triggered since it's not a test file
		'test(t => {});'
	],
	invalid: [
		{
			code: header + 'test(t => {});',
			errors
		},
		{
			code: header + 'test(t => {}, "my test name");',
			errors
		},
		{
			code: header + 'test(t => { t.pass(); t.end(); });',
			errors
		},
		{
			code: header + 'test.cb(t => { t.pass(); t.end(); });',
			errors
		},
		{
			code: header + 'test.cb.skip(t => { t.pass(); t.end(); });',
			errors
		},
		{
			code: header + 'test(t => { t.pass(); t.end(); });',
			errors
		},
		{
			code: header + 'test.todo();',
			errors
		}
	]
});

import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-only-test';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-only-test'}];
const header = `const test = require('ava');\n`;

ruleTester.run('no-only-test', rule, {
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + 'test.cb("my test name", t => { t.pass(); t.end(); });',
		header + 'test(t => { t.pass(); }); test(t => { t.pass(); });',
		header + 'notTest.only();',
		// Shouldn't be triggered since it's not a test file
		'test.only(t => {});'
	],
	invalid: [
		{
			code: header + 'test.only(t => { t.pass(); });',
			errors
		},
		{
			code: header + 'test.cb.only(t => { t.pass(); t.end(); });',
			errors
		},
		{
			code: header + 'test.only.cb(t => { t.pass(); t.end(); });',
			errors
		}
	]
});

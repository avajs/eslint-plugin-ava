import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-skip-test';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-skip-test'}];
const header = `const test = require('ava');\n`;

ruleTester.run('no-skip-test', rule, {
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + 'test.cb("my test name", t => { t.pass(); t.end(); });',
		header + 'test(t => { t.pass(); }); test(t => { t.pass(); });',
		header + 'test(t => { t.skip.is(1, 2); });',
		header + 'notTest.skip();',
			// shouldn't be triggered since it's not a test file
		'test.skip(t => {});'
	],
	invalid: [
		{
			code: header + 'test.skip(t => { t.pass(); });',
			errors
		},
		{
			code: header + 'test.cb.skip(t => { t.pass(); t.end(); });',
			errors
		},
		{
			code: header + 'test.skip.cb(t => { t.pass(); t.end(); });',
			errors
		}
	]
});

import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/no-skip-test';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-skip-test'}];
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('no-skip-test', rule, {
		valid: [
			header + 'test("my test name", function (t) { t.pass(); });',
			header + 'test.cb("my test name", function (t) { t.pass(); t.end(); });',
			header + 'test(function (t) { t.pass(); }); test(function (t) { t.pass(); });',
			header + 'test(function (t) { t.skip.is(1, 2); });',
			header + 'notTest.skip();',
			// shouldn't be triggered since it's not a test file
			'test.skip(t => {});'
		],
		invalid: [
			{
				code: header + 'test.skip(function (t) { t.pass(); });',
				errors
			},
			{
				code: header + 'test.cb.skip(function (t) { t.pass(); t.end(); });',
				errors
			},
			{
				code: header + 'test.skip.cb(function (t) { t.pass(); t.end(); });',
				errors
			}
		]
	});
});

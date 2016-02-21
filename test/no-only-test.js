import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/no-only-test';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-only-test'}];
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('no-only-test', rule, {
		valid: [
			header + 'test("my test name", function (t) { t.pass(); });',
			header + 'test.cb("my test name", function (t) { t.pass(); t.end(); });',
			header + 'test(function (t) { t.pass(); }); test(function (t) { t.pass(); });',
			header + 'notTest.only();',
			// shouldn't be triggered since it's not a test file
			'test.only(t => {});'
		],
		invalid: [
			{
				code: header + 'test.only(function (t) { t.pass(); });',
				errors
			},
			{
				code: header + 'test.cb.only(function (t) { t.pass(); t.end(); });',
				errors
			},
			{
				code: header + 'test.only.cb(function (t) { t.pass(); t.end(); });',
				errors
			}
		]
	});
});

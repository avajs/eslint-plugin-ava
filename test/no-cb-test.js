import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/no-cb-test';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-cb-test'}];
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('no-cb-test', rule, {
		valid: [
			header + 'test("my test name", function (t) { t.pass(); });',
			header + 'test.only("my test name", function (t) { t.pass(); });',
			header + 'notTest.cb(function (t) { t.pass(); });',
			// shouldn't be triggered since it's not a test file
			'test.cb(t => {});'
		],
		invalid: [
			{
				code: header + 'test.cb(function (t) { t.pass(); });',
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

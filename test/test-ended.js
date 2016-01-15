import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/test-ended';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'test-ended'}];
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('test-ended', rule, {
		valid: [
			header + 'test.cb(function (t) { t.pass(); t.end(); });',
			header + 'test.cb(function foo(t) { t.pass(); t.end(); });',
			header + 'test.cb(t => { t.pass(); t.end(); });',
			header + 'test.cb(t => { t.end(); });',
			header + 'test.cb(t => { t.end(); t.pass(); });',
			// shouldn't be triggered since it's not a test file
			'test.cb(t => {});'
		],
		invalid: [
			{
				code: header + 'test.cb(function (t) { t.pass(); });',
				errors
			},
			{
				code: header + 'test.cb(t => { t.pass(); });',
				errors
			},
			{
				code: header + 'test.cb(t => {});',
				errors
			}
		]
	});
});

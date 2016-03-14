import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/test-title';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'test-title'}];
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('test-title', rule, {
		valid: [
			header + 'test("my test name", function (t) { t.pass(); t.end(); });',
			header + 'test(`my test name`, function (t) { t.pass(); t.end(); });',
			header + 'test(\'my test name\', function (t) { t.pass(); t.end(); });',
			header + 'test.cb("my test name", t => { t.pass(); t.end(); });',
			header + 'test.todo("my test name");',
			{
				code: header + 'test(function (t) { t.pass(); t.end(); });',
				options: ['if-multiple']
			},
			header + 'notTest(t => { t.pass(); t.end(); });',
			// shouldn't be triggered since it's not a test file
			'test(t => {});'
		],
		invalid: [
			{
				code: header + 'test(function (t) { t.pass(); t.end(); });',
				errors
			},
			{
				code: header + 'test.cb(function (t) { t.pass(); t.end(); });',
				errors
			},
			{
				code: header + 'test.cb.skip(function (t) { t.pass(); t.end(); });',
				errors
			},
			{
				code: header + 'test(t => { t.pass(); t.end(); });',
				errors
			},
			{
				code: header + 'test.todo();',
				errors
			},
			{
				code: header + 'test(function (t) { t.pass(); t.end(); }); test(function (t) { t.pass(); t.end(); });',
				options: ['if-multiple'],
				errors
			}
		]
	});
});

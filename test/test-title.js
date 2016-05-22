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
			// default options should be `['if-multiple']`
			header + 'test(t => { t.pass(); t.end(); });',
			{
				code: header + 'test("my test name", t => { t.pass(); t.end(); });',
				options: ['always']
			},
			{
				code: header + 'test(`my test name`, t => { t.pass(); t.end(); });',
				options: ['always']
			},
			{
				code: header + 'test(\'my test name\', t => { t.pass(); t.end(); });',
				options: ['always']
			},
			{
				code: header + 'test.cb("my test name", t => { t.pass(); t.end(); });',
				options: ['always']
			},
			{
				code: header + 'test.todo("my test name");',
				options: ['always']
			},
			{
				code: header + 'test.before(t => {});',
				options: ['always']
			},
			{
				code: header + 'test.after(t => {});',
				options: ['always']
			},
			{
				code: header + 'test.beforeEach(t => {});',
				options: ['always']
			},
			{
				code: header + 'test.afterEach(t => {});',
				options: ['always']
			},
			{
				code: header + 'test.cb.before(t => {}); test.before.cb(t => {});',
				options: ['always']
			},
			{
				code: header + 'test(t => { t.pass(); t.end(); });',
				options: ['if-multiple']
			},
			{
				code: header + 'notTest(t => { t.pass(); t.end(); });',
				options: ['always']
			},
			{
				code: header + 'test(macroFn, arg1, arg2);',
				options: ['always']
			},
			// shouldn't be triggered since it's not a test file
			{
				code: 'test(t => {});',
				options: ['always']
			}
		],
		invalid: [
			{
				code: header + 'test(t => {}); test(t => {});',
				errors
			},
			{
				code: header + 'test(t => { t.pass(); t.end(); });',
				options: ['always'],
				errors
			},
			{
				code: header + 'test.cb(t => { t.pass(); t.end(); });',
				options: ['always'],
				errors
			},
			{
				code: header + 'test.cb.skip(t => { t.pass(); t.end(); });',
				options: ['always'],
				errors
			},
			{
				code: header + 'test(t => { t.pass(); t.end(); });',
				options: ['always'],
				errors
			},
			{
				code: header + 'test.todo();',
				options: ['always'],
				errors
			},
			{
				code: header + 'test(t => {}); test(t => {});',
				options: ['if-multiple'],
				errors
			}
		]
	});
});

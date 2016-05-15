import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/no-identical-title';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-identical-title'}];
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('no-identical-title', rule, {
		valid: [
			header + 'test("my test name", t => {});',
			header + 'test("a", t => {}); test(t => {});',
			header + 'test("a", t => {}); test("b", t => {});',
			header + 'test("a", t => {}); test.cb("b", t => {});',
			header + 'test.todo("a"); test.todo("b");',
			header + 'test("a", t => {}); notTest("a", t => {});',
			header + 'test(`foo ${name}`, t => {}); test(`foo ${name}`,  t => {});',
			header + 'const name = "foo"; test(name + " 1", t => {}); test(name + " 1", t => {});',
			header + 'test("a", t => {}); notTest("a", t => {});',
			header + 'notTest("a", t => {}); notTest("a", t => {});',
			header + 'test.before(t => {}); test.before(t => {});',
			header + 'test.after(t => {}); test.after(t => {});',
			header + 'test.beforeEach(t => {}); test.beforeEach(t => {});',
			header + 'test.afterEach(t => {}); test.afterEach(t => {});',
			header + 'test.cb.before(t => {}); test.before.cb(t => {});',
			header + 'test(t => {}); test(t => {});',
			header + 'test(t => {}); test.cb(t => {});',
			// shouldn't be triggered since it's not a test file
			'test(t => {}); test(t => {});',
			'test("a", t => {}); test("a", t => {});'
		],
		invalid: [
			{
				code: header + 'test("a", t => {}); test("a", t => {});',
				errors
			},
			{
				code: header + 'test(`a`, t => {}); test(`a`, t => {});',
				errors
			},
			{
				code: header + 'test("a", t => {}); test.cb("a", t => {});',
				errors
			},
			{
				code: header + 'test(`a`, t => {}); test.cb(`a`, t => {});',
				errors
			},
			{
				code: header + 'test("a", t => {}); test.cb.skip("a", t => {});',
				errors
			},
			{
				code: header + 'test("foo" + 1, t => {}); test("foo" + 1, t => {});',
				errors
			},
			{
				code: header + 'test(`${"foo" + 1}`, t => {}); test(`${"foo" + 1}`, t => {});',
				errors
			},
			{
				code: header + 'test.todo("a"); test.todo("a");',
				errors
			}
		]
	});
});

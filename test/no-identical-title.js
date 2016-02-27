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
const testFunction = `function (t) { t.pass(); }`;

test(() => {
	ruleTester.run('no-identical-title', rule, {
		valid: [
			header + 'test("my test name", function (t) { t.pass(); });',
			header + 'test(function (t) { t.pass(); });',
			header + 'test("a", function (t) { t.pass(); }); test("b", function (t) { t.pass(); });',
			header + 'test("a", function (t) { t.pass(); }); test.cb("b", function (t) { t.pass(); });',
			header + 'notTest("a", t => {}); notTest("a", t => {});',
			// shouldn't be triggered since it's not a test file
			'test(t => {}); test(t => {});',
			'test("a", t => {}); test("a", t => {});'
		],
		invalid: [
			{
				code: header + `test("a", ${testFunction}); test("a", ${testFunction});`,
				errors
			},
			{
				code: header + `test("a", ${testFunction}); test.cb("a", ${testFunction});`,
				errors
			},
			{
				code: header + `test("a", ${testFunction}); test.cb.skip("a", ${testFunction});`,
				errors
			},
			{
				code: header + `test("foo" + 1, ${testFunction}); test("foo" + 1, ${testFunction});`,
				errors
			},
			{
				code: header + `test(${testFunction}); test.cb(${testFunction});`,
				errors
			}
		]
	});
});

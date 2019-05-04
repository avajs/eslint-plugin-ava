import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/test-ended';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'test-ended'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('test-ended', rule, {
	valid: [
		header + 'test.cb(function (t) { t.pass(); t.end(); });',
		header + 'test.cb(function foo(t) { t.pass(); t.end(); });',
		header + 'test.cb(t => { t.pass(); t.end(); });',
		header + 'test.cb(t => { t.end(); });',
		header + 'test.cb(t => { t.end(); t.pass(); });',
		header + 'test.cb(t => { fn(t.end); });',
		header + 'test.cb.only(t => { t.end(); });',
		header + 'test.cb.skip.only(t => { t.end(); });',
		header + 'test.only.cb.skip(t => { t.end(); });',
		// Detecting that the called function has `end()` is not required #119
		header + 'const macro = t => {};\ntest.cb(macro);',
		// Shouldn't be triggered since it's not a callback test
		header + 'test(t => { t.pass(); });',
		// Shouldn't be triggered since it's not a test file
		'test.cb(t => {});'
	],
	invalid: [
		{
			code: header + 'test.cb(function (t) { t.pass(); });',
			errors
		},
		{
			// Detecting that the called function has `end()` can turn into a recursive resolution nightmare
			code: header + 'const macro = t => t.end();\ntest.cb((t) => macro(t));',
			errors
		},
		{
			code: header + 'test.cb(t => { t.pass(); });',
			errors
		},
		{
			code: header + 'test.cb(t => {});',
			errors
		},
		{
			code: header + 'test.cb.skip.only(t => {});',
			errors
		},
		{
			code: header + 'test.only.cb.skip(t => {});',
			errors
		}
	]
});

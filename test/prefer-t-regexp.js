import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/prefer-t-regexp';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'prefer-t-regexp'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('prefer-t-regexp', rule, {
	valid: [
		header + 'test(t => t.regex("foo", /\\d+/));',
		header + 'test(t => t.regex(foo(), /\\d+/));',
		header + 'test(t => t.is(/\\d+/.test("foo")), true);',
		'test(t => t.true(/\\d+/.test("foo")));',
	],
	invalid: [
		{
			code: header + 'test(t => t.true(/\\d+/.test("foo")));',
			errors
		},
		{
			code: header + 'test(t => t.false(/\\d+/.test("foo")));',
			errors
		},
		{
			code: header + 'test(t => t.true(/\\d+/.test(foo())));',
			errors
		},
		{
			code: header + 'const reg = /\\d+/;\ntest(t => t.true(reg.test(foo())));',
			errors
		}
	]
});

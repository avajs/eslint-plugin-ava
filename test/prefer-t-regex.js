import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/prefer-t-regex';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'prefer-t-regex'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('prefer-t-regex', rule, {
	valid: [
		header + 'test(t => t.regex("foo", /\\d+/));',
		header + 'test(t => t.regex(foo(), /\\d+/));',
		header + 'test(t => t.is(/\\d+/.test("foo")), true);',
		header + 'test(t => t.true(1 === 1));',
		header + 'test(t => t.true(foo));',
		header + 'const a = /\\d+/;\ntest(t => t.truthy(a));',
		header + 'const a = "not a regexp";\ntest(t => t.true(a.test("foo")));',
		// Shouldn't be triggered since it's not a test file
		'test(t => t.true(/\\d+/.test("foo")));'
	],
	invalid: [
		{
			code: header + 'test(t => t.true(/\\d+/.test("foo")));',
			output: header + 'test(t => t.regex("foo", /\\d+/));',
			errors
		},
		{
			code: header + 'test(t => t.false(foo.search(/\\d+/)));',
			output: header + 'test(t => t.notRegex(foo, /\\d+/));',
			errors
		},
		{
			code: header + 'const regexp = /\\d+/;\ntest(t => t.true(foo.search(regexp)));',
			output: header + 'const regexp = /\\d+/;\ntest(t => t.regex(foo, regexp));',
			errors
		},
		{
			code: header + 'test(t => t.truthy(foo.match(/\\d+/)));',
			output: header + 'test(t => t.regex(foo, /\\d+/));',
			errors
		},
		{
			code: header + 'test(t => t.false(/\\d+/.test("foo")));',
			output: header + 'test(t => t.notRegex("foo", /\\d+/));',
			errors
		},
		{
			code: header + 'test(t => t.true(/\\d+/.test(foo())));',
			output: header + 'test(t => t.regex(foo(), /\\d+/));',
			errors
		},
		{
			code: header + 'const reg = /\\d+/;\ntest(t => t.true(reg.test(foo.bar())));',
			output: header + 'const reg = /\\d+/;\ntest(t => t.regex(foo.bar(), reg));',
			errors
		}
	]
});

'use strict';

const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/prefer-t-regex');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true,
	},
});

const errors = assertion => [{
	message: `Prefer using the \`t.${assertion}()\` assertion.`,
}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('prefer-t-regex', rule, {
	valid: [
		header + 'test(t => t.regex("foo", /\\d+/));',
		header + 'test(t => t.regex(foo(), /\\d+/));',
		header + 'test(t => t.is(/\\d+/.test("foo"), foo));',
		header + 'test(t => t.is(RegExp("\\d+").test("foo"), foo));',
		header + 'test(t => t.is(RegExp(/\\d+/).test("foo"), foo));',
		header + 'test(t => t.is(/\\d+/, /\\w+/));',
		header + 'test(t => t.is(123, /\\d+/));',
		header + 'test(t => t.true(1 === 1));',
		header + 'test(t => t.true(foo.bar()));',
		header + 'test(t => t.is(foo, true));',
		header + 'const a = /\\d+/;\ntest(t => t.truthy(a));',
		header + 'const a = "not a regexp";\ntest(t => t.true(a.test("foo")));',
		header + 'test("main", t => t.true(foo()));',
		header + 'test(t => t.regex(foo, new RegExp("\\d+")));',
		header + 'test(t => t.regex(foo, RegExp("\\d+")));',
		header + 'test(t => t.regex(foo, new RegExp(/\\d+/)));',
		header + 'test(t => t.regex(foo, RegExp(/\\d+/)));',
		// Shouldn't be triggered since it's not a test file
		'test(t => t.true(/\\d+/.test("foo")));',
		'test(t => t.true());',
		// These shouldn't cause errors as this rule affects them.
		// This rule would crash on the following.
		header + 'test(t => t.true());',
		header + 'test(t => t.is(true))',
		header + 'test(t => t.is())',
		header + 'test(t => t.false())',
		header + 'test(t => t.falsy())',
		header + 'test(t => t.truthy())',
		header + 'test(t => t.deepEqual(true))',
	],
	invalid: [
		{
			code: header + 'test(t => t.true(/\\d+/.test("foo")));',
			output: header + 'test(t => t.regex("foo", /\\d+/));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.false(foo.search(/\\d+/)));',
			output: header + 'test(t => t.notRegex(foo, /\\d+/));',
			errors: errors('notRegex'),
		},
		{
			code: header + 'const regexp = /\\d+/;\ntest(t => t.true(foo.search(regexp)));',
			output: header + 'const regexp = /\\d+/;\ntest(t => t.regex(foo, regexp));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.truthy(foo.match(/\\d+/)));',
			output: header + 'test(t => t.regex(foo, /\\d+/));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.false(/\\d+/.test("foo")));',
			output: header + 'test(t => t.notRegex("foo", /\\d+/));',
			errors: errors('notRegex'),
		},
		{
			code: header + 'test(t => t.true(/\\d+/.test(foo())));',
			output: header + 'test(t => t.regex(foo(), /\\d+/));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.is(/\\d+/.test(foo), true));',
			output: header + 'test(t => t.regex(foo, /\\d+/));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.is(/\\d+/.test(foo), false));',
			output: header + 'test(t => t.notRegex(foo, /\\d+/));',
			errors: errors('notRegex'),
		},
		{
			code: header + 'const reg = /\\d+/;\ntest(t => t.true(reg.test(foo.bar())));',
			output: header + 'const reg = /\\d+/;\ntest(t => t.regex(foo.bar(), reg));',
			errors: errors('regex'),
		},
		// The same as the above tests but with `RegExp()` object instead of a regex literal
		{
			code: header + 'test(t => t.true(new RegExp("\\d+").test("foo")));',
			output: header + 'test(t => t.regex("foo", new RegExp("\\d+")));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.false(foo.search(new RegExp("\\d+"))));',
			output: header + 'test(t => t.notRegex(foo, new RegExp("\\d+")));',
			errors: errors('notRegex'),
		},
		{
			code: header + 'const regexp = RegExp("\\d+");\ntest(t => t.true(foo.search(regexp)));',
			output: header + 'const regexp = RegExp("\\d+");\ntest(t => t.regex(foo, regexp));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.truthy(foo.match(new RegExp("\\d+"))));',
			output: header + 'test(t => t.regex(foo, new RegExp("\\d+")));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.false(RegExp("\\d+").test("foo")));',
			output: header + 'test(t => t.notRegex("foo", RegExp("\\d+")));',
			errors: errors('notRegex'),
		},
		{
			code: header + 'test(t => t.true(new RegExp("\\d+").test(foo())));',
			output: header + 'test(t => t.regex(foo(), new RegExp("\\d+")));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.is(new RegExp("\\d+").test(foo), true));',
			output: header + 'test(t => t.regex(foo, new RegExp("\\d+")));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.is(new RegExp("\\d+").test(foo), false));',
			output: header + 'test(t => t.notRegex(foo, new RegExp("\\d+")));',
			errors: errors('notRegex'),
		},
		{
			code: header + 'const reg = RegExp("\\d+");\ntest(t => t.true(reg.test(foo.bar())));',
			output: header + 'const reg = RegExp("\\d+");\ntest(t => t.regex(foo.bar(), reg));',
			errors: errors('regex'),
		},
		// The same as the above tests but with regex literal instead of string regex
		{
			code: header + 'test(t => t.true(new RegExp(/\\d+/).test("foo")));',
			output: header + 'test(t => t.regex("foo", new RegExp(/\\d+/)));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.false(foo.search(new RegExp(/\\d+/))));',
			output: header + 'test(t => t.notRegex(foo, new RegExp(/\\d+/)));',
			errors: errors('notRegex'),
		},
		{
			code: header + 'const regexp = RegExp(/\\d+/);\ntest(t => t.true(foo.search(regexp)));',
			output: header + 'const regexp = RegExp(/\\d+/);\ntest(t => t.regex(foo, regexp));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.truthy(foo.match(new RegExp(/\\d+/))));',
			output: header + 'test(t => t.regex(foo, new RegExp(/\\d+/)));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.false(RegExp(/\\d+/).test("foo")));',
			output: header + 'test(t => t.notRegex("foo", RegExp(/\\d+/)));',
			errors: errors('notRegex'),
		},
		{
			code: header + 'test(t => t.true(new RegExp(/\\d+/).test(foo())));',
			output: header + 'test(t => t.regex(foo(), new RegExp(/\\d+/)));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.is(new RegExp(/\\d+/).test(foo), true));',
			output: header + 'test(t => t.regex(foo, new RegExp(/\\d+/)));',
			errors: errors('regex'),
		},
		{
			code: header + 'test(t => t.is(new RegExp(/\\d+/).test(foo), false));',
			output: header + 'test(t => t.notRegex(foo, new RegExp(/\\d+/)));',
			errors: errors('notRegex'),
		},
		{
			code: header + 'const reg = RegExp(/\\d+/);\ntest(t => t.true(reg.test(foo.bar())));',
			output: header + 'const reg = RegExp(/\\d+/);\ntest(t => t.regex(foo.bar(), reg));',
			errors: errors('regex'),
		},
	],
});

import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/prefer-t-regex.js';

const ruleTester = new RuleTester();

const errors = [{messageId: 'prefer-t-regex'}];
ruleTester.run('prefer-t-regex', rule, {
	valid: [
		String.raw`test(t => t.regex("foo", /\d+/));`,
		String.raw`test(t => t.regex(foo(), /\d+/));`,
		String.raw`test(t => t.is(/\d+/.test("foo"), foo));`,
		String.raw`test(t => t.is(RegExp("\d+").test("foo"), foo));`,
		String.raw`test(t => t.is(RegExp(/\d+/).test("foo"), foo));`,
		String.raw`test(t => t.is(/\d+/, /\w+/));`,
		String.raw`test(t => t.is(123, /\d+/));`,
		'test(t => t.true(1 === 1));',
		'test(t => t.true(foo.bar()));',
		'test(t => t.is(foo, true));',
		'const a = /\\d+/;\ntest(t => t.truthy(a));',
		'const a = "not a regexp";\ntest(t => t.true(a.test("foo")));',
		'test("main", t => t.true(foo()));',
		String.raw`test(t => t.regex(foo, new RegExp("\d+")));`,
		String.raw`test(t => t.regex(foo, RegExp("\d+")));`,
		String.raw`test(t => t.regex(foo, new RegExp(/\d+/)));`,
		String.raw`test(t => t.regex(foo, RegExp(/\d+/)));`,
		// Shouldn't be triggered since it's not a test file
		{code: String.raw`test(t => t.true(/\d+/.test("foo")));`, noHeader: true},
		{code: 'test(t => t.true());', noHeader: true},
		// These shouldn't cause errors as this rule affects them.
		// This rule would crash on the following.
		'test(t => t.true());',
		'test(t => t.is(true))',
		'test(t => t.is())',
		'test(t => t.false())',
		'test(t => t.falsy())',
		'test(t => t.truthy())',
		'test(t => t.deepEqual(true))',
		String.raw`test(t => t.is(/\d+/))`,
	],
	invalid: [
		{
			code: String.raw`test(t => t.true(/\d+/.test("foo")));`,
			output: String.raw`test(t => t.regex("foo", /\d+/));`,
			errors,
		},
		{
			code: String.raw`test(t => t.false(foo.search(/\d+/)));`,
			output: String.raw`test(t => t.notRegex(foo, /\d+/));`,
			errors,
		},
		{
			code: 'const regexp = /\\d+/;\ntest(t => t.true(foo.search(regexp)));',
			output: 'const regexp = /\\d+/;\ntest(t => t.regex(foo, regexp));',
			errors,
		},
		{
			code: String.raw`test(t => t.truthy(foo.match(/\d+/)));`,
			output: String.raw`test(t => t.regex(foo, /\d+/));`,
			errors,
		},
		{
			code: String.raw`test(t => t.false(/\d+/.test("foo")));`,
			output: String.raw`test(t => t.notRegex("foo", /\d+/));`,
			errors,
		},
		{
			code: String.raw`test(t => t.true(/\d+/.test(foo())));`,
			output: String.raw`test(t => t.regex(foo(), /\d+/));`,
			errors,
		},
		{
			code: String.raw`test(t => t.is(/\d+/.test(foo), true));`,
			output: String.raw`test(t => t.regex(foo, /\d+/));`,
			errors,
		},
		{
			code: String.raw`test(t => t.is(/\d+/.test(foo), false));`,
			output: String.raw`test(t => t.notRegex(foo, /\d+/));`,
			errors,
		},
		{
			code: 'const reg = /\\d+/;\ntest(t => t.true(reg.test(foo.bar())));',
			output: 'const reg = /\\d+/;\ntest(t => t.regex(foo.bar(), reg));',
			errors,
		},
		// The same as the above tests but with `RegExp()` object instead of a regex literal
		{
			code: String.raw`test(t => t.true(new RegExp("\d+").test("foo")));`,
			output: String.raw`test(t => t.regex("foo", new RegExp("\d+")));`,
			errors,
		},
		{
			code: String.raw`test(t => t.false(foo.search(new RegExp("\d+"))));`,
			output: String.raw`test(t => t.notRegex(foo, new RegExp("\d+")));`,
			errors,
		},
		{
			code: 'const regexp = RegExp("\\d+");\ntest(t => t.true(foo.search(regexp)));',
			output: 'const regexp = RegExp("\\d+");\ntest(t => t.regex(foo, regexp));',
			errors,
		},
		{
			code: String.raw`test(t => t.truthy(foo.match(new RegExp("\d+"))));`,
			output: String.raw`test(t => t.regex(foo, new RegExp("\d+")));`,
			errors,
		},
		{
			code: String.raw`test(t => t.false(RegExp("\d+").test("foo")));`,
			output: String.raw`test(t => t.notRegex("foo", RegExp("\d+")));`,
			errors,
		},
		{
			code: String.raw`test(t => t.true(new RegExp("\d+").test(foo())));`,
			output: String.raw`test(t => t.regex(foo(), new RegExp("\d+")));`,
			errors,
		},
		{
			code: String.raw`test(t => t.is(new RegExp("\d+").test(foo), true));`,
			output: String.raw`test(t => t.regex(foo, new RegExp("\d+")));`,
			errors,
		},
		{
			code: String.raw`test(t => t.is(new RegExp("\d+").test(foo), false));`,
			output: String.raw`test(t => t.notRegex(foo, new RegExp("\d+")));`,
			errors,
		},
		{
			code: 'const reg = RegExp("\\d+");\ntest(t => t.true(reg.test(foo.bar())));',
			output: 'const reg = RegExp("\\d+");\ntest(t => t.regex(foo.bar(), reg));',
			errors,
		},
		// The same as the above tests but with regex literal instead of string regex
		{
			code: String.raw`test(t => t.true(new RegExp(/\d+/).test("foo")));`,
			output: String.raw`test(t => t.regex("foo", new RegExp(/\d+/)));`,
			errors,
		},
		{
			code: String.raw`test(t => t.false(foo.search(new RegExp(/\d+/))));`,
			output: String.raw`test(t => t.notRegex(foo, new RegExp(/\d+/)));`,
			errors,
		},
		{
			code: 'const regexp = RegExp(/\\d+/);\ntest(t => t.true(foo.search(regexp)));',
			output: 'const regexp = RegExp(/\\d+/);\ntest(t => t.regex(foo, regexp));',
			errors,
		},
		{
			code: String.raw`test(t => t.truthy(foo.match(new RegExp(/\d+/))));`,
			output: String.raw`test(t => t.regex(foo, new RegExp(/\d+/)));`,
			errors,
		},
		{
			code: String.raw`test(t => t.false(RegExp(/\d+/).test("foo")));`,
			output: String.raw`test(t => t.notRegex("foo", RegExp(/\d+/)));`,
			errors,
		},
		{
			code: String.raw`test(t => t.true(new RegExp(/\d+/).test(foo())));`,
			output: String.raw`test(t => t.regex(foo(), new RegExp(/\d+/)));`,
			errors,
		},
		{
			code: String.raw`test(t => t.is(new RegExp(/\d+/).test(foo), true));`,
			output: String.raw`test(t => t.regex(foo, new RegExp(/\d+/)));`,
			errors,
		},
		{
			code: String.raw`test(t => t.is(new RegExp(/\d+/).test(foo), false));`,
			output: String.raw`test(t => t.notRegex(foo, new RegExp(/\d+/)));`,
			errors,
		},
		{
			code: 'const reg = RegExp(/\\d+/);\ntest(t => t.true(reg.test(foo.bar())));',
			output: 'const reg = RegExp(/\\d+/);\ntest(t => t.regex(foo.bar(), reg));',
			errors,
		},
		// Alternative test object names for t.try() callbacks
		{
			code: String.raw`test(t => tt.true(/\d+/.test("foo")));`,
			output: String.raw`test(t => tt.regex("foo", /\d+/));`,
			errors,
		},
	],
});

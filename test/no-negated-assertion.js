import RuleTester, {testCase} from './helpers/rule-tester.js';
import rule from '../rules/no-negated-assertion.js';

const ruleTester = new RuleTester();

const errors = [{messageId: 'no-negated-assertion'}];

ruleTester.run('no-negated-assertion', rule, {
	valid: [
		testCase('t.true(x)'),
		testCase('t.false(x)'),
		testCase('t.truthy(x)'),
		testCase('t.falsy(x)'),
		testCase('t.is(!x, y)'),
		testCase('t.assert(!x)'),
		testCase('t.true(x, "message")'),
		testCase('t.true()'),
		// Not a test object
		testCase('foo.true(!x)'),
		// `t.context` is not an assertion
		testCase('t.context.true(!x)'),
		// Invalid modifier order; handled by other rules
		testCase('t.skip.true(!x)'),
		// Invalid trailing member; handled by other rules
		testCase('t.true.context(!x)'),
		// Shouldn't be triggered since it's not a test file
		{code: testCase('t.true(!x)'), noHeader: true},
	],
	invalid: [
		{
			code: testCase('t.true(!x)'),
			output: testCase('t.falsy(x)'),
			errors,
		},
		{
			code: testCase('t.false(!x)'),
			output: testCase('t.truthy(x)'),
			errors,
		},
		{
			code: testCase('t.truthy(!x)'),
			output: testCase('t.falsy(x)'),
			errors,
		},
		{
			code: testCase('t.falsy(!x)'),
			output: testCase('t.truthy(x)'),
			errors,
		},
		// With message argument
		{
			code: testCase('t.true(!x, "msg")'),
			output: testCase('t.falsy(x, "msg")'),
			errors,
		},
		// Complex expressions
		{
			code: testCase('t.true(!foo.bar)'),
			output: testCase('t.falsy(foo.bar)'),
			errors,
		},
		{
			code: testCase('t.true(!foo())'),
			output: testCase('t.falsy(foo())'),
			errors,
		},
		{
			code: testCase('t.true(!(a === b))'),
			output: testCase('t.falsy(a === b)'),
			errors,
		},
		{
			code: testCase('t.true(!(a, b))'),
			output: testCase('t.falsy((a, b))'),
			errors,
		},
		// With .skip
		{
			code: testCase('t.true.skip(!x)'),
			output: testCase('t.falsy.skip(x)'),
			errors,
		},
		{
			code: testCase('t.truthy.skip(!x)'),
			output: testCase('t.falsy.skip(x)'),
			errors,
		},
		{
			code: testCase('t.true.skip.skip(!x)'),
			output: testCase('t.falsy.skip.skip(x)'),
			errors,
		},
		// Double negation
		{
			code: testCase('t.true(!!x)'),
			output: testCase('t.truthy(x)'),
			errors,
		},
		{
			code: testCase('t.false(!!x)'),
			output: testCase('t.falsy(x)'),
			errors,
		},
		{
			code: testCase('t.truthy(!!x)'),
			output: testCase('t.truthy(x)'),
			errors,
		},
		{
			code: testCase('t.true.skip(!!x)'),
			output: testCase('t.truthy.skip(x)'),
			errors,
		},
		{
			code: testCase('t.true(!!(a, b))'),
			output: testCase('t.truthy((a, b))'),
			errors,
		},
		// Non-boolean values
		{
			code: testCase('t.true(!0)'),
			output: testCase('t.falsy(0)'),
			errors,
		},
		{
			code: testCase('t.false(!0)'),
			output: testCase('t.truthy(0)'),
			errors,
		},
		{
			code: testCase('t.true(!!1)'),
			output: testCase('t.truthy(1)'),
			errors,
		},
		{
			code: testCase('t.false(!!1)'),
			output: testCase('t.falsy(1)'),
			errors,
		},
		// Alternative test object names
		{
			code: testCase('tt.true(!x)'),
			output: testCase('tt.falsy(x)'),
			errors,
		},
	],
});

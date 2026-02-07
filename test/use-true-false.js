import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/use-true-false.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const trueErrors = [{messageId: 'use-true'}];
const falseErrors = [{messageId: 'use-false'}];
const isTrueErrors = [{messageId: 'use-true-over-is'}];
const isFalseErrors = [{messageId: 'use-false-over-is'}];

const header = 'const test = require(\'ava\');\n';

function testCase(contents, prependHeader) {
	const content = `test(t => { ${contents} });`;

	if (prependHeader !== false) {
		return header + content;
	}

	return content;
}

ruleTester.run('use-true-false', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		testCase('t.true(true)'),
		testCase('t.true(false)'),
		testCase('t.true(value == 1)'),
		testCase('t.true(value === 1)'),
		testCase('t.true(value != 1)'),
		testCase('t.true(value !== 1)'),
		testCase('t.true(value < 1)'),
		testCase('t.true(value <= 1)'),
		testCase('t.true(value > 1)'),
		testCase('t.true(value >= 1)'),
		testCase('t.true(!value)'),
		testCase('t.true(!!value)'),
		testCase('t.false(value === 1)'),
		testCase('t.truthy(value)'),
		testCase('t.truthy(value())'),
		testCase('t.truthy(value + value)'),
		testCase('t.falsy(value)'),
		testCase('t.falsy(value())'),
		testCase('t.falsy(value + value)'),
		testCase('t.truthy()'),
		testCase('t.falsy()'),
		testCase('t.context.truthy(true)'),
		testCase('t.context.falsy(false)'),
		testCase('foo.t.truthy(true)'),
		testCase('foo.t.falsy(false)'),
		// `t.is()` with non-boolean literals should not trigger
		testCase('t.is(value, 1)'),
		testCase('t.is(value, "string")'),
		testCase('t.is(value, null)'),
		testCase('t.is(value, undefined)'),
		// `t.is()` with both boolean literals should not trigger
		testCase('t.is(true, true)'),
		testCase('t.is(true, false)'),
		// `t.is()` with too few arguments should not trigger
		testCase('t.is(true)'),
		testCase('t.is()'),
		// Shouldn't be triggered since it's not a test file
		testCase('t.truthy(value === 1)', false),
	],
	invalid: [
		{
			code: testCase('t.truthy(true)'),
			output: testCase('t.true(true)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(false)'),
			output: testCase('t.true(false)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(value == 1)'),
			output: testCase('t.true(value == 1)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(value === 1)'),
			output: testCase('t.true(value === 1)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(value != 1)'),
			output: testCase('t.true(value != 1)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(value !== 1)'),
			output: testCase('t.true(value !== 1)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(value < 1)'),
			output: testCase('t.true(value < 1)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(value <= 1)'),
			output: testCase('t.true(value <= 1)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(value > 1)'),
			output: testCase('t.true(value > 1)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(value >= 1)'),
			output: testCase('t.true(value >= 1)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(!value)'),
			output: testCase('t.true(!value)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(!!value)'),
			output: testCase('t.true(!!value)'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(Array.isArray(value))'),
			output: testCase('t.true(Array.isArray(value))'),
			errors: trueErrors,
		},
		{
			code: testCase('t.truthy(isFinite(3))'),
			output: testCase('t.true(isFinite(3))'),
			errors: trueErrors,
		},
		{
			code: testCase('t.falsy(value === 1)'),
			output: testCase('t.false(value === 1)'),
			errors: falseErrors,
		},
		// `t.is(x, true)` → `t.true(x)`
		{
			code: testCase('t.is(x, true)'),
			output: testCase('t.true(x)'),
			errors: isTrueErrors,
		},
		// `t.is(x, false)` → `t.false(x)`
		{
			code: testCase('t.is(x, false)'),
			output: testCase('t.false(x)'),
			errors: isFalseErrors,
		},
		// Boolean literal in first argument position
		{
			code: testCase('t.is(true, x)'),
			output: testCase('t.true(x)'),
			errors: isTrueErrors,
		},
		{
			code: testCase('t.is(false, x)'),
			output: testCase('t.false(x)'),
			errors: isFalseErrors,
		},
		// With assertion message
		{
			code: testCase('t.is(x, true, "message")'),
			output: testCase('t.true(x, "message")'),
			errors: isTrueErrors,
		},
		{
			code: testCase('t.is(x, false, "message")'),
			output: testCase('t.false(x, "message")'),
			errors: isFalseErrors,
		},
		// Boolean literal in first position with assertion message
		{
			code: testCase('t.is(true, x, "message")'),
			output: testCase('t.true(x, "message")'),
			errors: isTrueErrors,
		},
		{
			code: testCase('t.is(false, x, "message")'),
			output: testCase('t.false(x, "message")'),
			errors: isFalseErrors,
		},
	],
});

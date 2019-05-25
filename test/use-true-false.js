import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/use-true-false';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const trueErrors = [{
	ruleId: 'use-true-false',
	message: '`t.true()` should be used instead of `t.truthy()`.'
}];

const falseErrors = [{
	ruleId: 'use-true-false',
	message: '`t.false()` should be used instead of `t.falsy()`.'
}];

const header = 'const test = require(\'ava\');\n';

function testCase(contents, prependHeader) {
	const content = `test(t => { ${contents} });`;

	if (prependHeader !== false) {
		return header + content;
	}

	return content;
}

ruleTester.run('use-true-false', rule, {
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
		// Shouldn't be triggered since it's not a test file
		testCase('t.truthy(value === 1)', false)
	],
	invalid: [
		{
			code: testCase('t.truthy(true)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(false)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(value == 1)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(value === 1)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(value != 1)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(value !== 1)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(value < 1)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(value <= 1)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(value > 1)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(value >= 1)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(!value)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(!!value)'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(Array.isArray(value))'),
			errors: trueErrors
		},
		{
			code: testCase('t.truthy(isFinite(3))'),
			errors: trueErrors
		},
		{
			code: testCase('t.falsy(value === 1)'),
			errors: falseErrors
		}
	]
});

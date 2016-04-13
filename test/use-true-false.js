import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/use-true-false';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const trueErrors = [{ruleId: 'use-true-false', message: '`t.true(x)` should be used instead of `t.truthy(x)`'}];
const falseErrors = [{ruleId: 'use-true-false', message: '`t.false(x)` should be used instead of `t.falsy(x)`'}];
const header = `const test = require('ava');\n`;

function testCase(contents, prependHeader) {
	const content = `test(t => { ${contents} });`;
	if (prependHeader !== false) {
		return header + content;
	}

	return content;
}

test(() => {
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
			// shouldn't be triggered since it's not a test file
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
				code: testCase('t.falsy(value === 1)'),
				errors: falseErrors
			}
		]
	});
});

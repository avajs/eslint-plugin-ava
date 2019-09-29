import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/use-t-throws-async-well';

const ruleTester = avaRuleTester(test, {
	parserOptions: {
		ecmaVersion: 2020
	}
});

const header = 'const test = require(\'ava\');\n';

function testCase(contents, prependHeader) {
	const content = `test(async t => { ${contents} });`;

	if (prependHeader !== false) {
		return header + content;
	}

	return content;
}

ruleTester.run('use-t-throws-async-well', rule, {
	valid: [
		testCase('await t.throwsAsync(f)'),
		testCase('await t.notThrowsAsync(f)'),
		testCase('t.throws(f)'),
		testCase('t.notThrows(f)'),
		testCase('f(t.throwsAsync(f))'),
		testCase('let p = t.throwsAsync(f)'),
		testCase('p = t.throwsAsync(f)'),
		// // Shouldn't be triggered since it's not a test file
		testCase('t.throwsAsync(f)', false)
	],
	invalid: [
		{
			code: testCase('t.throwsAsync(f)'),
			errors: [{
				ruleId: 'use-t-throws-async-well',
				message: 'Use `await` with `t.throwsAsync()`.'
			}]
		},
		{
			code: testCase('t.notThrowsAsync(f)'),
			errors: [{
				ruleId: 'use-t-throws-async-well',
				message: 'Use `await` with `t.notThrowsAsync()`.'
			}]
		}
	]
});

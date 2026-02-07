import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/use-t-throws-async-well.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';

function asyncTestCase(contents, prependHeader) {
	const content = `test(async t => { ${contents} });`;

	if (prependHeader !== false) {
		return header + content;
	}

	return content;
}

function syncTestCase(contents, prependHeader) {
	const content = `test(t => { ${contents} });`;

	if (prependHeader !== false) {
		return header + content;
	}

	return content;
}

ruleTester.run('use-t-throws-async-well', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		asyncTestCase('await t.throwsAsync(f)'),
		asyncTestCase('await t.notThrowsAsync(f)'),
		asyncTestCase('t.throws(f)'),
		asyncTestCase('t.notThrows(f)'),
		asyncTestCase('f(t.throwsAsync(f))'),
		asyncTestCase('let p = t.throwsAsync(f)'),
		asyncTestCase('p = t.throwsAsync(f)'),
		asyncTestCase('t.throwsAsync(f)', false), // Shouldn't be triggered since it's not a test file
		syncTestCase('t.throwsAsync(f)', false), // Shouldn't be triggered since it's not a test file
	],
	invalid: [
		{
			code: syncTestCase('t.throwsAsync(f)'),
			errors: [{
				message: 'Use `await` with `t.throwsAsync()`.',
			}],
		},
		{
			code: syncTestCase('t.notThrowsAsync(f)'),
			errors: [{
				message: 'Use `await` with `t.notThrowsAsync()`.',
			}],
		},
		{
			code: asyncTestCase('t.throwsAsync(f)'),
			output: asyncTestCase('await t.throwsAsync(f)'),
			errors: [{
				message: 'Use `await` with `t.throwsAsync()`.',
			}],
		},
		{
			code: asyncTestCase('t.notThrowsAsync(f)'),
			output: asyncTestCase('await t.notThrowsAsync(f)'),
			errors: [{
				message: 'Use `await` with `t.notThrowsAsync()`.',
			}],
		},
	],
});

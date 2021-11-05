'use strict';

const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/use-t-throws-async-well');

const ruleTester = avaRuleTester(test, {
	parserOptions: {
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

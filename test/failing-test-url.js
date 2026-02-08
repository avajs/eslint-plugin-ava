import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/failing-test-url.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const messageId = 'failing-test-url';
const header = 'const test = require(\'ava\');\n';

ruleTester.run('failing-test-url', rule, {
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + '// https://github.com/avajs/ava/issues/123\ntest.failing(t => { t.pass(); });',
		header + '/* https://github.com/avajs/ava/issues/123 */\ntest.failing(t => { t.pass(); });',
		header + '// See http://example.com/issue\ntest.failing(t => { t.pass(); });',
		header + '// Tracking issue: https://github.com/avajs/ava/issues/123\ntest.failing(t => { t.pass(); });',
		header + '// https://github.com/avajs/ava/issues/123\ntest.serial.failing(t => { t.pass(); });',
		// Not a test file
		'test.failing(t => { t.pass(); });',
		// Not a test call
		header + 'notTest.failing();',
	],
	invalid: [
		{
			code: header + 'test.failing(t => { t.pass(); });',
			errors: [{messageId, line: 2, column: 6}],
		},
		{
			code: header + '// TODO: fix this\ntest.failing(t => { t.pass(); });',
			errors: [{messageId, line: 3, column: 6}],
		},
		{
			code: header + 'test.serial.failing(t => { t.pass(); });',
			errors: [{messageId, line: 2, column: 13}],
		},
		{
			code: header + '// See issue #123\ntest.failing(t => { t.pass(); });',
			errors: [{messageId, line: 3, column: 6}],
		},
		{
			// URL comment separated by code should not count
			code: header + '// https://github.com/avajs/ava/issues/123\nconst foo = 1;\ntest.failing(t => { t.pass(); });',
			errors: [{messageId, line: 4, column: 6}],
		},
	],
});

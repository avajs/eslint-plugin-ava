import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/failing-test-url.js';

const ruleTester = new RuleTester();

const messageId = 'failing-test-url';

ruleTester.run('failing-test-url', rule, {
	valid: [
		'test("my test name", t => { t.pass(); });',
		'// https://github.com/avajs/ava/issues/123\ntest.failing(t => { t.pass(); });',
		'/* https://github.com/avajs/ava/issues/123 */\ntest.failing(t => { t.pass(); });',
		'// See http://example.com/issue\ntest.failing(t => { t.pass(); });',
		'// Tracking issue: https://github.com/avajs/ava/issues/123\ntest.failing(t => { t.pass(); });',
		'// https://github.com/avajs/ava/issues/123\ntest.serial.failing(t => { t.pass(); });',
		// Not a test file
		{code: 'test.failing(t => { t.pass(); });', noHeader: true},
		// Not a test call
		'notTest.failing();',
	],
	invalid: [
		{
			code: 'test.failing(t => { t.pass(); });',
			errors: [{messageId, line: 2, column: 6}],
		},
		{
			code: '// TODO: fix this\ntest.failing(t => { t.pass(); });',
			errors: [{messageId, line: 3, column: 6}],
		},
		{
			code: 'test.serial.failing(t => { t.pass(); });',
			errors: [{messageId, line: 2, column: 13}],
		},
		{
			code: '// See issue #123\ntest.failing(t => { t.pass(); });',
			errors: [{messageId, line: 3, column: 6}],
		},
		{
			// URL comment separated by code should not count
			code: '// https://github.com/avajs/ava/issues/123\nconst foo = 1;\ntest.failing(t => { t.pass(); });',
			errors: [{messageId, line: 4, column: 6}],
		},
	],
});

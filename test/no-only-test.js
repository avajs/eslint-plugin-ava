import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-only-test.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
});

const message = '`test.only()` should not be used.';
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-only-test', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + 'test(t => { t.pass(); }); test(t => { t.pass(); });',
		header + 'notTest.only();',
		// Shouldn't be triggered since it's not a test file
		'test.only(t => {});',
	],
	invalid: [
		{
			code: header + 'test\n\t.only(t => { t.pass(); });',
			errors: [{
				message,
				line: 3,
				column: 3,
				suggestions: [{
					desc: 'Remove the `.only`',
					output: header + 'test\n\t(t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test\n  .only(t => { t.pass(); });',
			errors: [{
				message,
				line: 3,
				column: 4,
				suggestions: [{
					desc: 'Remove the `.only`',
					output: header + 'test\n  (t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test\t.only(t => { t.pass(); });',
			errors: [{
				message,
				line: 2,
				column: 7,
				suggestions: [{
					desc: 'Remove the `.only`',
					output: header + 'test\t(t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test  .only(t => { t.pass(); });',
			errors: [{
				message,
				line: 2,
				column: 8,
				suggestions: [{
					desc: 'Remove the `.only`',
					output: header + 'test  (t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test.\n\tonly(t => { t.pass(); });',
			errors: [{
				message,
				line: 3,
				column: 2,
				suggestions: [{
					desc: 'Remove the `.only`',
					output: header + 'test\n\t(t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test.\n  only(t => { t.pass(); });',
			errors: [{
				message,
				line: 3,
				column: 3,
				suggestions: [{
					desc: 'Remove the `.only`',
					output: header + 'test\n  (t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test.only(t => { t.pass(); });',
			errors: [{
				message,
				line: 2,
				column: 6,
				suggestions: [{
					desc: 'Remove the `.only`',
					output: header + 'test(t => { t.pass(); });',
				}],
			}],
		},
	],
});

const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/no-only-test');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	},
	parserOptions: {
		sourceType: 'module'
	}
});

const message = '`test.only()` should not be used.';
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-only-test', rule, {
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + 'test.cb("my test name", t => { t.pass(); t.end(); });',
		header + 'test(t => { t.pass(); }); test(t => { t.pass(); });',
		header + 'notTest.only();',
		// Shouldn't be triggered since it's not a test file
		'test.only(t => {});'
	],
	invalid: [
		{
			code: header + 'test\n\t.only(t => { t.pass(); });',
			output: header + 'test\n\t(t => { t.pass(); });',
			errors: [{
				message,
				type: 'Identifier',
				line: 3,
				column: 3
			}]
		},
		{
			code: header + 'test\n  .only(t => { t.pass(); });',
			output: header + 'test\n  (t => { t.pass(); });',
			errors: [{
				message,
				type: 'Identifier',
				line: 3,
				column: 4
			}]
		},
		{
			code: header + 'test\t.only(t => { t.pass(); });',
			output: header + 'test\t(t => { t.pass(); });',
			errors: [{
				message,
				type: 'Identifier',
				line: 2,
				column: 7
			}]
		},
		{
			code: header + 'test  .only(t => { t.pass(); });',
			output: header + 'test  (t => { t.pass(); });',
			errors: [{
				message,
				type: 'Identifier',
				line: 2,
				column: 8
			}]
		},
		{
			code: header + 'test.\n\tonly(t => { t.pass(); });',
			output: header + 'test\n\t(t => { t.pass(); });',
			errors: [{
				message,
				type: 'Identifier',
				line: 3,
				column: 2
			}]
		},
		{
			code: header + 'test.\n  only(t => { t.pass(); });',
			output: header + 'test\n  (t => { t.pass(); });',
			errors: [{
				message,
				type: 'Identifier',
				line: 3,
				column: 3
			}]
		},
		{
			code: header + 'test.only(t => { t.pass(); });',
			output: header + 'test(t => { t.pass(); });',
			errors: [{
				message,
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		},
		{
			code: header + 'test.cb.only(t => { t.pass(); t.end(); });',
			output: header + 'test.cb(t => { t.pass(); t.end(); });',
			errors: [{
				message,
				type: 'Identifier',
				line: 2,
				column: 9
			}]
		},
		{
			code: header + 'test.only.cb(t => { t.pass(); t.end(); });',
			output: header + 'test.cb(t => { t.pass(); t.end(); });',
			errors: [{
				message,
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		}
	]
});

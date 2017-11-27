import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-skip-test';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const ruleId = 'no-skip-test';
const message = 'No tests should be skipped.';
const header = `const test = require('ava');\n`;

ruleTester.run('no-skip-test', rule, {
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + 'test.cb("my test name", t => { t.pass(); t.end(); });',
		header + 'test(t => { t.pass(); }); test(t => { t.pass(); });',
		header + 'test(t => { t.skip.is(1, 2); });',
		header + 'notTest.skip();',
			// Shouldn't be triggered since it's not a test file
		'test.skip(t => {});'
	],
	invalid: [
		{
			code: header + 'test.skip(t => { t.pass(); });',
			output: header + 'test(t => { t.pass(); });',
			errors: [{
				ruleId,
				message,
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		},
		{
			code: header + 'test.cb.skip(t => { t.pass(); t.end(); });',
			output: header + 'test.cb(t => { t.pass(); t.end(); });',
			errors: [{
				ruleId,
				message,
				type: 'Identifier',
				line: 2,
				column: 9
			}]
		},
		{
			code: header + 'test.skip.cb(t => { t.pass(); t.end(); });',
			output: header + 'test.cb(t => { t.pass(); t.end(); });',
			errors: [{
				ruleId,
				message,
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		},
		{
			code: header + 'test.\n\tskip.cb(t => { t.pass(); t.end(); });',
			output: header + 'test\n\t.cb(t => { t.pass(); t.end(); });',
			errors: [{
				ruleId,
				message,
				type: 'Identifier',
				line: 3,
				column: 2
			}]
		},
		{
			code: header + 'test  .skip  .cb(t => { t.pass(); t.end(); });',
			output: header + 'test    .cb(t => { t.pass(); t.end(); });',
			errors: [{
				ruleId,
				message,
				type: 'Identifier',
				line: 2,
				column: 8
			}]
		},
	]
});

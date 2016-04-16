import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/no-commented-test';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

function errorAt(line, column) {
	return {
		ruleId: 'no-commented-tests',
		line,
		column
	};
}
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('no-commented-tests', rule, {
		valid: [
			header + 'test("my test name", t => { t.pass(); });',
			// shouldn't be triggered since it's not a test file
			'test.cb(t => {});\n// test.cb(t=> {})'
		],
		invalid: [
			{
				code: header + 'test.cb(t => { t.pass(); });\n// test.cb(t=> {})',
				errors: [errorAt(3, 4)]
			},
			{
				code: header + 'test.cb(t => { t.pass(); });\n // test.cb(t=> {})',
				errors: [errorAt(3, 5)]
			},
			{
				code: header + 'test.cb(t => { t.pass(); });\n//  test.cb(t=> {})',
				errors: [errorAt(3, 5)]
			},
			{
				code: header + 'test.cb(t => { t.pass(); });\n// This is not javascript!\n// test.cb(t=> {})',
				errors: [errorAt(4, 4)]
			}
		]
	});
});

import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/no-skip-assert';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-skip-assert'}];
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('no-skip-assert', rule, {
		valid: [
			header + 'test(function (t) { t.is(1, 1); });',
			header + 'test.skip(function (t) { t.is(1, 1); });',
			header + 'test(function (t) { notT.skip.is(1, 1); });',
			// shouldn't be triggered since it's not a test file
			'test(function (t) { t.skip.is(1, 1); });'
		],
		invalid: [
			{
				code: header + 'test(function (t) { t.skip.is(1, 1); });',
				errors
			},
			{
				code: header + 'test.cb(function (t) { t.skip.is(1, 1); t.end(); });',
				errors
			},
			{
				code: header + 'test.skip(function (t) { t.skip.is(1, 1); });',
				errors
			}
		]
	});
});

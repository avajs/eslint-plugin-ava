import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/prefer-power-assert';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'prefer-power-assert'}];
const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('prefer-power-assert', rule, {
		valid: [
			header + 'test(t => { t.ok(foo); });',
			header + 'test(t => { t.same(foo, bar); });',
			header + 'test(t => { t.notSame(foo, bar); });',
			header + 'test(t => { t.throws(block); });',
			header + 'test(t => { t.notThrows(block); });',
			header + 'test.cb(function (t) { t.ok(foo); t.end(); });',
			// shouldn't be triggered since it's not a test file
			'test(t => {});'
		],
		invalid: [
			{
				code: header + 'test(t => { t.notOk(foo); });',
				errors
			},
			{
				code: header + 'test(t => { t.true(foo); });',
				errors
			},
			{
				code: header + 'test(t => { t.false(foo); });',
				errors
			},
			{
				code: header + 'test(t => { t.is(foo, bar); });',
				errors
			},
			{
				code: header + 'test(t => { t.not(foo, bar); });',
				errors
			},
			{
				code: header + 'test(t => { t.regex(str, re); });',
				errors
			},
			{
				code: header + 'test(t => { t.ifError(err); });',
				errors
			}
		]
	});
});

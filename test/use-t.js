import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/use-t';

const ruleTester = new RuleTester({
	env: {
		es6: true
	},
	parserOptions: {
		sourceType: 'module'
	}
});

const parameterNotNamedTErrors = [{
	ruleId: 'use-t',
	message: 'Test parameter should be named `t`.'
}];

const tooManyParametersErrors = [{
	ruleId: 'use-t',
	message: 'Test should only have one parameter named `t`.'
}];

const header = `const test = require('ava');\n`;

test(() => {
	ruleTester.run('use-t', rule, {
		valid: [
			header + 'test(() => {});',
			header + 'test(t => {});',
			header + 'test.cb(t => {});',
			// header + 'test("test name", t => {});',
			header + 'test(function (t) {});',
			header + 'test(testFunction);',
			header + 'test.todo("test name");',
			// shouldn't be triggered since it's not a test file
			'test(foo => {});'
		],
		invalid: [
			{
				code: header + 'test(foo => {});',
				errors: parameterNotNamedTErrors
			},
			{
				code: header + 'test("test name", foo => {});',
				errors: parameterNotNamedTErrors
			},
			{
				code: header + 'test.cb(foo => { foo.end(); });',
				errors: parameterNotNamedTErrors
			},
			{
				code: header + 'test(function (foo) {});',
				errors: parameterNotNamedTErrors
			},
			{
				code: header + 'test((t, foo) => {});',
				errors: tooManyParametersErrors
			},
			{
				code: header + 'test((foo, t) => {});',
				errors: tooManyParametersErrors
			},
			{
				code: header + 'test("test name", (t, foo) => {});',
				errors: tooManyParametersErrors
			}
		]
	});
});

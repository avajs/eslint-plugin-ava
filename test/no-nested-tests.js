import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-nested-tests.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';
const error = {
	messageId: 'no-nested-tests',
};

ruleTester.run('no-nested-tests', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test(t => {});',
		header + 'test("title", t => {});',
		header + 'test(t => {}); test(t => {});',
		header + 'test("title", t => {}); test("title", t => {});',
		header + 'test.skip(t => {});',
		header + 'test.skip(t => {}); test.skip(t => {});',
		header + 'test.only(t => {});',
		header + 'test.only(t => {}); test.only(t => {});',
		// Shouldn't be triggered since it's not a test file
		'test(t => { test(t => {}); });',
	],
	invalid: [
		{
			code: header + 'test("2", t => { test(t => {}); });',
			errors: [error],
		},
		{
			code: header + 'test(t => { test(t => {}); test(t => {}); });',
			errors: [error, error],
		},
		{
			code: header + 'test(t => { test(t => { test(t => {}); }); });',
			errors: [error, error],
		},
	],
});

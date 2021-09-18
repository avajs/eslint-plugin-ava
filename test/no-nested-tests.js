const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/no-nested-tests');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true,
	},
});

const header = 'const test = require(\'ava\');\n';
const error = {
	message: 'Tests should not be nested.',
};

ruleTester.run('no-nested-tests', rule, {
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

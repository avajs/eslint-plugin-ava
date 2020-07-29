const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/no-invalid-modifier-chain');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-invalid-modifier-chain'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-invalid-modifier-chain', rule, {
	valid: [
		header + 'test(t => {})',
		header + 'test.only(t => {});',
		// Not using the test variable
		header + 'notTest.skap(t => {});',
		// Not a test file
		'test.skap(t => {});'
	],
	invalid: [
		{
			code: header + 'test.skap(t => {})',
			errors
		},
		{
			code: header + 'test.serial.skap(t => {})',
			errors
		},
		{
			code: header + 'test.failing.failing(t => {})',
			errors
		},
		{
			code: header + 'test.todo.only(t => {})',
			errors
		},
		{
			code: header + 'test.failing.serial(t => {})',
			errors
		},
		{
			code: header + 'test.only.skip(t => {})',
			errors
		},
		{
			code: header + 'test.skip.only(t => {})',
			errors
		},
		{
			code: header + 'test.before.always(t => {})',
			errors
		},
		{
			code: header + 'test.always.after(t => {})',
			errors
		},
		{
			code: header + 'test.before.only(t => {})',
			errors
		}
	]
});

const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/no-invalid-end');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-invalid-end'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-invalid-end', rule, {
	valid: [
		header + 'test(t => {});',
		header + 'test(t => { t.is(1, 1); });',
		header + 'test.only(t => {});',
		header + 'test.cb(t => { t.end(); });',
		header + 'test.cb(t => { t.end.skip(); });',
		header + 'test.cb.only(t => { t.end(); });',
		header + 'notTest(t => { t.end(); });',
		header + 'test(t => { t.context.end(); })',
		header + 'test(t => { foo.t.end(); })',
		// Shouldn't be triggered since it's not a test file
		'test(t => { t.end(); });'
	],
	invalid: [
		{
			code: header + 'test(t => { t.end(); });',
			errors
		},
		{
			code: header + 'test.only(t => { t.end(); });',
			errors
		},
		{
			code: header + 'test(t => { t.end.skip(); });',
			errors
		}
	]
});

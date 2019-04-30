import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-skip-assert';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-skip-assert'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-skip-assert', rule, {
	valid: [
		header + 'test(t => { t.is(1, 1); });',
		header + 'test.skip(t => { t.is(1, 1); });',
		header + 'test(t => { notT.skip.is(1, 1); });',
		header + 'test(t => { t.context.skip.is(1, 1); });',
		header + 'test(t => { foo.t.skip.is(1, 1); });',
		// Shouldn't be triggered since it's not a test file
		'test(t => { t.skip.is(1, 1); });'
	],
	invalid: [
		{
			code: header + 'test(t => { t.skip.is(1, 1); });',
			errors
		},
		{
			code: header + 'test(t => { t.is.skip(1, 1); });',
			errors
		},
		{
			code: header + 'test.cb(t => { t.skip.is(1, 1); t.end(); });',
			errors
		},
		{
			code: header + 'test.skip(t => { t.skip.is(1, 1); });',
			errors
		}
	]
});

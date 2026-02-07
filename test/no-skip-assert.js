import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-skip-assert.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-skip-assert', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test(t => { t.is(1, 1); });',
		header + 'test.skip(t => { t.is(1, 1); });',
		// Not an actual AVA skip
		header + 'test(t => { notT.skip.is(1, 1); });',
		header + 'test(t => { t.context.is.skip(1, 1); });',
		header + 'test(t => { foo.t.is.skip(1, 1); });',
		header + 'test(t => { t.skip(); });',
		// Shouldn't be triggered since it's not a test file
		'test(t => { t.is.skip(1, 1); });',
	],
	invalid: [
		{
			code: header + 'test(t => { t.is.skip(1, 1); });',
			errors: [{
				messageId: 'no-skip-assert',
				suggestions: [{
					messageId: 'no-skip-assert-suggestion',
					output: header + 'test(t => { t.is(1, 1); });',
				}],
			}],
		},
		{
			code: header + 'test(t => { t.true.skip(1); });',
			errors: [{
				messageId: 'no-skip-assert',
				suggestions: [{
					messageId: 'no-skip-assert-suggestion',
					output: header + 'test(t => { t.true(1); });',
				}],
			}],
		},
		{
			code: header + 'test.skip(t => { t.is.skip(1, 1); });',
			errors: [{
				messageId: 'no-skip-assert',
				suggestions: [{
					messageId: 'no-skip-assert-suggestion',
					output: header + 'test.skip(t => { t.is(1, 1); });',
				}],
			}],
		},
		// Alternative test object names for t.try() callbacks
		{
			code: header + 'test(t => { tt.is.skip(1, 1); });',
			errors: [{
				messageId: 'no-skip-assert',
				suggestions: [{
					messageId: 'no-skip-assert-suggestion',
					output: header + 'test(t => { tt.is(1, 1); });',
				}],
			}],
		},
	],
});

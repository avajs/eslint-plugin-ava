import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-skip-assert.js';

const ruleTester = new RuleTester();

ruleTester.run('no-skip-assert', rule, {
	valid: [
		'test(t => { t.is(1, 1); });',
		'test.skip(t => { t.is(1, 1); });',
		// Not an actual AVA skip
		'test(t => { notT.skip.is(1, 1); });',
		'test(t => { t.context.is.skip(1, 1); });',
		'test(t => { foo.t.is.skip(1, 1); });',
		'test(t => { t.skip(); });',
		// Shouldn't be triggered since it's not a test file
		{code: 'test(t => { t.is.skip(1, 1); });', noHeader: true},
	],
	invalid: [
		{
			code: 'test(t => { t.is.skip(1, 1); });',
			errors: [{
				messageId: 'no-skip-assert',
				suggestions: [{
					messageId: 'no-skip-assert-suggestion',
					output: 'test(t => { t.is(1, 1); });',
				}],
			}],
		},
		{
			code: 'test(t => { t.true.skip(1); });',
			errors: [{
				messageId: 'no-skip-assert',
				suggestions: [{
					messageId: 'no-skip-assert-suggestion',
					output: 'test(t => { t.true(1); });',
				}],
			}],
		},
		{
			code: 'test.skip(t => { t.is.skip(1, 1); });',
			errors: [{
				messageId: 'no-skip-assert',
				suggestions: [{
					messageId: 'no-skip-assert-suggestion',
					output: 'test.skip(t => { t.is(1, 1); });',
				}],
			}],
		},
		// Alternative test object names for t.try() callbacks
		{
			code: 'test(t => { tt.is.skip(1, 1); });',
			errors: [{
				messageId: 'no-skip-assert',
				suggestions: [{
					messageId: 'no-skip-assert-suggestion',
					output: 'test(t => { tt.is(1, 1); });',
				}],
			}],
		},
	],
});

import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-unknown-modifiers.js';

const ruleTester = new RuleTester();

ruleTester.run('no-unknown-modifiers', rule, {
	valid: [
		'test(t => {});',
		'test.after(t => {});',
		'test.afterEach(t => {});',
		'test.before(t => {});',
		'test.beforeEach(t => {});',
		'test.default(t => {});',
		'test.default.serial(t => {});',
		'test.only(t => {});',
		'test.serial(t => {});',
		'test.skip(t => {});',
		'test.todo(t => {});',
		'test.after.always(t => {});',
		'test.afterEach.always(t => {});',
		'test.after.always.skip(t => {});',
		'test.failing(t => {});',
		'test.macro(t => {});',
		// Shouldn't be triggered since it's not a test file
		{code: 'test.foo(t => {});', noHeader: true},
	],
	invalid: [
		{
			code: 'test.foo(t => {});',
			errors: [{
				messageId: 'no-unknown-modifiers',
				suggestions: [{
					messageId: 'no-unknown-modifiers-suggestion',
					output: 'test(t => {});',
				}],
			}],
		},
		{
			code: 'test.onlu(t => {});',
			errors: [{
				messageId: 'no-unknown-modifiers',
				suggestions: [{
					messageId: 'no-unknown-modifiers-suggestion',
					output: 'test(t => {});',
				}],
			}],
		},
		{
			code: 'test.beforeeach(t => {});',
			errors: [{
				messageId: 'no-unknown-modifiers',
				suggestions: [{
					messageId: 'no-unknown-modifiers-suggestion',
					output: 'test(t => {});',
				}],
			}],
		},
		{
			code: 'test.c.only(t => {});',
			errors: [{
				messageId: 'no-unknown-modifiers',
				suggestions: [{
					messageId: 'no-unknown-modifiers-suggestion',
					output: 'test.only(t => {});',
				}],
			}],
		},
		{
			code: 'test.cb(t => {});',
			errors: [{
				messageId: 'no-unknown-modifiers',
				suggestions: [{
					messageId: 'no-unknown-modifiers-suggestion',
					output: 'test(t => {});',
				}],
			}],
		},
		{
			code: 'test.foo.bar.baz(t => {});',
			errors: [
				{
					messageId: 'no-unknown-modifiers',
					suggestions: [{
						messageId: 'no-unknown-modifiers-suggestion',
						output: 'test.bar.baz(t => {});',
					}],
				},
				{
					messageId: 'no-unknown-modifiers',
					suggestions: [{
						messageId: 'no-unknown-modifiers-suggestion',
						output: 'test.foo.baz(t => {});',
					}],
				},
				{
					messageId: 'no-unknown-modifiers',
					suggestions: [{
						messageId: 'no-unknown-modifiers-suggestion',
						output: 'test.foo.bar(t => {});',
					}],
				},
			],
		},
		{
			code: 'test.test(t => {});',
			errors: [{
				messageId: 'no-unknown-modifiers',
				suggestions: [{
					messageId: 'no-unknown-modifiers-suggestion',
					output: 'test(t => {});',
				}],
			}],
		},
		{
			code: 'test.always(t => {});',
			errors: [{
				messageId: 'always-without-after',
				suggestions: [{
					messageId: 'always-without-after-suggestion',
					output: 'test(t => {});',
				}],
			}],
		},
		{
			code: 'test.before.always(t => {});',
			errors: [{
				messageId: 'always-without-after',
				suggestions: [{
					messageId: 'always-without-after-suggestion',
					output: 'test.before(t => {});',
				}],
			}],
		},
		{
			code: 'test.beforeEach.always(t => {});',
			errors: [{
				messageId: 'always-without-after',
				suggestions: [{
					messageId: 'always-without-after-suggestion',
					output: 'test.beforeEach(t => {});',
				}],
			}],
		},
		{
			code: 'test.serial.always(t => {});',
			errors: [{
				messageId: 'always-without-after',
				suggestions: [{
					messageId: 'always-without-after-suggestion',
					output: 'test.serial(t => {});',
				}],
			}],
		},
		{
			code: 'test.foo.always(t => {});',
			errors: [
				{
					messageId: 'no-unknown-modifiers',
					suggestions: [{
						messageId: 'no-unknown-modifiers-suggestion',
						output: 'test.always(t => {});',
					}],
				},
				{
					messageId: 'always-without-after',
					suggestions: [{
						messageId: 'always-without-after-suggestion',
						output: 'test.foo(t => {});',
					}],
				},
			],
		},
	],
});

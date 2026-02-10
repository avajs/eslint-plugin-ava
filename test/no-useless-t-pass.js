import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-useless-t-pass.js';

const ruleTester = new RuleTester();

const errors = [{messageId: 'no-useless-t-pass'}];

ruleTester.run('no-useless-t-pass', rule, {
	valid: [
		// Useful: t.pass() with t.plan()
		' test(t => { t.plan(1); t.pass(); });',
		// Multiple assertions including t.pass() with t.plan()
		' test(t => { t.plan(2); t.pass(); t.is(1, 1); });',
		// No t.pass() at all
		' test(t => { t.is(1, 1); });',
		// Not a test file
		{code: 'test(t => { t.pass(); });', noHeader: true},
		// Reversed order: t.pass() before t.plan()
		' test(t => { t.pass(); t.plan(1); });',
		// Context usage is not an assertion
		' test(t => { t.context.pass(); });',
		// Test modifiers with t.plan()
		' test.serial(t => { t.plan(1); t.pass(); });',
		' test.failing(t => { t.plan(1); t.pass(); });',
		// Skipped pass with t.plan()
		' test(t => { t.plan(1); t.skip.pass(); });',
		// Not a test object (foo.t.pass)
		` test(t => { ${'foo.t.pass(); '.repeat(2)}});`,
		// Shadowed callback parameter should not be treated as AVA test object
		' test(t => { setTimeout(t => { t.pass(); }, 0); });',
	],
	invalid: [
		{
			code: ' test(t => { t.pass(); });',
			errors,
		},
		{
			code: ' test(t => { t.pass(\'message\'); });',
			errors,
		},
		{
			code: ' test(t => { t.pass(); t.pass(); });',
			errors: [...errors, ...errors],
		},
		{
			code: ' test(t => { t.pass(); t.is(1, 1); });',
			errors,
		},
		{
			code: ' test(t => { t.skip.pass(); });',
			errors,
		},
		// Two tests: one valid (has t.plan), one invalid (no t.plan) - ensures state resets
		{
			code: ' test(t => { t.plan(1); t.pass(); }); test(t => { t.pass(); });',
			errors,
		},
		// Alternative test object name
		{
			code: ' test(t => { tt.pass(); });',
			errors,
		},
		// Hooks: t.plan() is not available, so t.pass() is always useless
		{
			code: ' test.before(t => { t.pass(); });',
			errors,
		},
		{
			code: ' test.beforeEach(t => { t.pass(); });',
			errors,
		},
		{
			code: ' test.after(t => { t.pass(); });',
			errors,
		},
		{
			code: ' test.afterEach(t => { t.pass(); });',
			errors,
		},
		// Test modifiers without t.plan()
		{
			code: ' test.serial(t => { t.pass(); });',
			errors,
		},
		{
			code: ' test.failing(t => { t.pass(); });',
			errors,
		},
		// State reset: invalid then valid
		{
			code: ' test(t => { t.pass(); }); test(t => { t.plan(1); t.pass(); });',
			errors,
		},
		// Nested callback with t.pass()
		{
			code: ' test(t => { setTimeout(() => { t.pass(); }, 0); });',
			errors,
		},
		// Async test
		{
			code: ' test(async t => { t.pass(); });',
			errors,
		},
		// `tt.plan()` should not suppress outer `t.pass()`
		{
			code: ' test(async t => { const attempt = await t.try(tt => { tt.plan(1); tt.pass(); }); t.pass(); await attempt.commit(); });',
			errors,
		},
		// Outer `t.plan()` should not suppress inner `tt.pass()`
		{
			code: ' test(async t => { t.plan(1); const attempt = await t.try(tt => { tt.pass(); }); await attempt.commit(); });',
			errors,
		},
	],
});

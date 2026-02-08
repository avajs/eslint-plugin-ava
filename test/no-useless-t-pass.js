import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-useless-t-pass.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';

const error = [{messageId: 'no-useless-t-pass'}];

ruleTester.run('no-useless-t-pass', rule, {
	valid: [
		// Useful: t.pass() with t.plan()
		`${header} test(t => { t.plan(1); t.pass(); });`,
		// Multiple assertions including t.pass() with t.plan()
		`${header} test(t => { t.plan(2); t.pass(); t.is(1, 1); });`,
		// No t.pass() at all
		`${header} test(t => { t.is(1, 1); });`,
		// Not a test file
		'test(t => { t.pass(); });',
		// Reversed order: t.pass() before t.plan()
		`${header} test(t => { t.pass(); t.plan(1); });`,
		// Context usage is not an assertion
		`${header} test(t => { t.context.pass(); });`,
		// Test modifiers with t.plan()
		`${header} test.serial(t => { t.plan(1); t.pass(); });`,
		`${header} test.failing(t => { t.plan(1); t.pass(); });`,
		// Skipped pass with t.plan()
		`${header} test(t => { t.plan(1); t.skip.pass(); });`,
		// Not a test object (foo.t.pass)
		`${header} test(t => { ${'foo.t.pass(); '.repeat(2)}});`,
		// ESM import
		'import test from \'ava\';\n test(t => { t.plan(1); t.pass(); });',
	],
	invalid: [
		{
			code: `${header} test(t => { t.pass(); });`,
			errors: error,
		},
		{
			code: `${header} test(t => { t.pass('message'); });`,
			errors: error,
		},
		{
			code: `${header} test(t => { t.pass(); t.pass(); });`,
			errors: [...error, ...error],
		},
		{
			code: `${header} test(t => { t.pass(); t.is(1, 1); });`,
			errors: error,
		},
		{
			code: `${header} test(t => { t.skip.pass(); });`,
			errors: error,
		},
		// Two tests: one valid (has t.plan), one invalid (no t.plan) - ensures state resets
		{
			code: `${header} test(t => { t.plan(1); t.pass(); }); test(t => { t.pass(); });`,
			errors: error,
		},
		// Alternative test object name
		{
			code: `${header} test(t => { tt.pass(); });`,
			errors: error,
		},
		// Hooks: t.plan() is not available, so t.pass() is always useless
		{
			code: `${header} test.before(t => { t.pass(); });`,
			errors: error,
		},
		{
			code: `${header} test.beforeEach(t => { t.pass(); });`,
			errors: error,
		},
		{
			code: `${header} test.after(t => { t.pass(); });`,
			errors: error,
		},
		{
			code: `${header} test.afterEach(t => { t.pass(); });`,
			errors: error,
		},
		// Test modifiers without t.plan()
		{
			code: `${header} test.serial(t => { t.pass(); });`,
			errors: error,
		},
		{
			code: `${header} test.failing(t => { t.pass(); });`,
			errors: error,
		},
		// State reset: invalid then valid
		{
			code: `${header} test(t => { t.pass(); }); test(t => { t.plan(1); t.pass(); });`,
			errors: error,
		},
		// Nested callback with t.pass()
		{
			code: `${header} test(t => { setTimeout(() => { t.pass(); }, 0); });`,
			errors: error,
		},
		// Async test
		{
			code: `${header} test(async t => { t.pass(); });`,
			errors: error,
		},
		// ESM import
		{
			code: 'import test from \'ava\';\n test(t => { t.pass(); });',
			errors: error,
		},
	],
});

import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-conditional-assertion.js';

const ruleTester = new RuleTester();

const error = {
	messageId: 'no-conditional-assertion',
};

ruleTester.run('no-conditional-assertion', rule, {
	valid: [
		// Unconditional assertions
		'test(t => { t.is(1, 1); });',
		'test(t => { t.true(true); t.is(1, 1); });',
		// Assertion after a conditional block
		'test(t => { if (x) { setup(); } t.is(a, b); });',
		// Assertion in try block (only catch is conditional)
		'test(t => { try { t.is(a, b); } catch {} });',
		// Assertion in finally block (always executes)
		'test(t => { try { foo(); } catch {} finally { t.pass(); } });',
		// T.plan inside a conditional is fine (not an assertion)
		'test(t => { if (x) { t.plan(1); } t.is(1, 1); });',
		// T.log inside a conditional is fine (not an assertion)
		'test(t => { if (x) { t.log("debug"); } t.pass(); });',
		// T.teardown inside a conditional is fine (not an assertion)
		'test(t => { if (x) { t.teardown(() => {}); } t.pass(); });',
		// Non-test object inside a conditional
		'test(t => { if (x) { foo.is(1, 1); } });',
		// Not a test file
		{code: 'test(t => { if (x) { t.is(1, 1); } });', noHeader: true},
		// If/else with assertions in both branches (all paths covered)
		'test(t => { if (x) { t.true(y); } else { t.false(z); } });',
		// Ternary with assertions in both sides (all paths covered)
		'test(t => { x ? t.is(a, b) : t.is(c, d); });',
		// If/else if/else with assertions in all branches
		'test(t => { if (x) { t.is(a, 1); } else if (y) { t.is(a, 2); } else { t.is(a, 3); } });',
		// Switch with all cases + default having assertions
		'test(t => { switch (x) { case 1: t.is(a, 1); break; case 2: t.is(a, 2); break; default: t.is(a, 3); } });',
		// Switch fallthrough where assertion appears in a later case
		'test(t => { switch (x) { case 1: case 2: t.is(a, 2); break; default: t.is(a, 3); } });',
		// Switch with only default case (always matches)
		'test(t => { switch (x) { default: t.is(a, b); } });',
		// Nested balanced if/else inside balanced if/else
		'test(t => { if (a) { if (b) { t.is(1, 1); } else { t.is(2, 2); } } else { t.is(3, 3); } });',
		// If/else with assertions returned in both branches
		'test(t => { if (x) { return t.is(a, b); } else { return t.is(c, d); } });',
		// Ternary as assertion argument (not wrapping the assertion)
		'test(t => { t.is(x ? a : b, expected); });',
		// Balanced if/else where one branch wraps assertion in try/finally
		'test(t => { if (x) { try { t.pass(); } finally {} } else { t.pass(); } });',
		// Assertion guaranteed by finally in one branch
		'test(t => { if (x) { try { setup(); } finally { t.pass(); } } else { t.pass(); } });',
		// Assertion in finally still counts when try branch returns early
		'test(t => { if (x) { try { return; } finally { t.pass(); } } else { t.pass(); } });',
		// Switch case assertion wrapped in try/finally
		'test(t => { switch (x) { case 1: try { t.pass(); } finally {} break; default: t.pass(); } });',
		// Assertion in if-test expression should not be treated as branch-conditional
		'test(t => { if (t.truthy(value)) { setup(); } });',
		// Assertion in conditional-expression test should not be treated as branch-conditional
		'test(t => { t.truthy(value) ? setup() : teardown(); });',
		// Assertion on left side of short-circuit expression always executes
		'test(t => { t.pass() && setup(); });',
		// Logical expression with guaranteed assertion in one if-branch is balanced
		'test(t => { if (x) { t.pass() && setup(); } else { t.pass(); } });',
	],
	invalid: [
		// If statement without else
		{
			code: 'test(t => { if (x) { t.is(a, b); } });',
			errors: [error],
		},
		// If/else where only one branch has an assertion
		{
			code: 'test(t => { if (x) { t.is(a, b); } else { setup(); } });',
			errors: [error],
		},
		// Switch/case without default
		{
			code: 'test(t => { switch (x) { case 1: t.is(a, b); break; } });',
			errors: [error],
		},
		// Catch clause
		{
			code: 'test(t => { try { foo(); } catch { t.pass(); } });',
			errors: [error],
		},
		// Catch clause flagged even when try block also has assertion
		{
			code: 'test(t => { try { t.is(a, b); } catch { t.pass(); } });',
			errors: [error],
		},
		// Nested conditionals (inner if has no else)
		{
			code: 'test(t => { if (x) { if (y) { t.is(a, b); } } });',
			errors: [error],
		},
		// Nested conditional assertion does not cover all outer-if paths
		{
			code: 'test(t => { if (x) { if (y) { t.is(a, b); } } else { t.is(c, d); } });',
			errors: [error, error],
		},
		// Early exit in subpath before later assertion
		{
			code: 'test(t => { if (x) { if (y) { return; } t.is(a, b); } else { t.is(c, d); } });',
			errors: [error, error],
		},
		// Test object aliases
		{
			code: 'test(t => { if (x) { tt.is(a, b); } });',
			errors: [error],
		},
		// With .skip modifier
		{
			code: 'test(t => { if (x) { t.throws.skip(fn); } });',
			errors: [error],
		},
		// Else-if chain without final else (inner if is unbalanced)
		{
			code: 'test(t => { if (x) { t.is(a, 1); } else if (y) { t.is(a, 2); } });',
			errors: [error, error],
		},
		// Multiple switch cases without default
		{
			code: 'test(t => { switch (x) { case 1: t.is(a, 1); break; case 2: t.is(a, 2); break; } });',
			errors: [error, error],
		},
		// Assertion inside a hook's conditional
		{
			code: 'test.beforeEach(t => { if (x) { t.fail(); } });',
			errors: [error],
		},
		// Assertion only in else block
		{
			code: 'test(t => { if (x) { setup(); } else { t.is(a, b); } });',
			errors: [error],
		},
		// Assertion inside callback within conditional
		{
			code: 'test(t => { if (x) { [].forEach(() => t.is(a, b)); } });',
			errors: [error],
		},
		// `t.try()` inside conditional
		{
			code: 'test(t => { if (x) { t.try(tt => tt.is(a, b)); } });',
			errors: [error, error],
		},
		// Switch with default but one case missing assertion
		{
			code: 'test(t => { switch (x) { case 1: t.is(a, 1); break; case 2: break; default: t.is(a, 3); } });',
			errors: [error, error],
		},
		// Multiple assertions in same unbalanced branch
		{
			code: 'test(t => { if (x) { t.is(a, 1); t.true(y); } });',
			errors: [error, error],
		},
		// Ternary with assertion in only one side
		{
			code: 'test(t => { x ? t.is(a, b) : null; });',
			errors: [error],
		},
		// Async assertion in conditional
		{
			code: 'test(async t => { if (x) { await t.throwsAsync(fn); } });',
			errors: [error],
		},
		// Try/catch in one branch with assertion only in try is not guaranteed
		{
			code: 'test(t => { if (x) { try { t.pass(); } catch {} } else { t.pass(); } });',
			errors: [error, error],
		},
		// Try/finally with no assertion in one switch case
		{
			code: 'test(t => { switch (x) { case 1: try { setup(); } finally {} break; default: t.pass(); } });',
			errors: [error],
		},
		// Catch assertion is still disallowed even when finally asserts
		{
			code: 'test(t => { if (x) { try { setup(); } catch { t.pass(); } finally { t.pass(); } } else { t.pass(); } });',
			errors: [error],
		},
		// Catch-only assertion does not guarantee assertion for try path
		{
			code: 'test(t => { if (x) { try { setup(); } catch { t.pass(); } } else { t.pass(); } });',
			errors: [error, error],
		},
		// Catch assertions are still disallowed when try/catch is otherwise balanced
		{
			code: 'test(t => { if (x) { try { t.pass(); } catch { t.pass(); } } else { t.pass(); } });',
			errors: [error],
		},
		// Switch case with try/catch where only catch asserts is unbalanced
		{
			code: 'test(t => { switch (x) { case 1: try { setup(); } catch { t.pass(); } break; default: t.pass(); } });',
			errors: [error, error],
		},
		// Logical AND short-circuit makes right-side assertion conditional
		{
			code: 'test(t => { ready && t.is(value, 1); });',
			errors: [error],
		},
		// Logical OR short-circuit makes right-side assertion conditional
		{
			code: 'test(t => { ready || t.is(value, 1); });',
			errors: [error],
		},
		// Nullish coalescing short-circuit makes right-side assertion conditional
		{
			code: 'test(t => { ready ?? t.is(value, 1); });',
			errors: [error],
		},
		// Assertion in if-test can still be conditional due inner short-circuit
		{
			code: 'test(t => { if (ready && t.is(value, 1)) { setup(); } });',
			errors: [error],
		},
		// Conditional assertion in one branch makes whole if unbalanced
		{
			code: 'test(t => { if (x) { ready && t.pass(); } else { t.pass(); } });',
			errors: [error, error],
		},
	],
});

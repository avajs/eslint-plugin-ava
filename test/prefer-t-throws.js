import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/prefer-t-throws.js';

const ruleTester = new RuleTester();

const syncError = {messageId: 'prefer-t-throws'};
const asyncError = {messageId: 'prefer-t-throws-async'};

ruleTester.run('prefer-t-throws', rule, {
	valid: [
		// Try/catch without `t.fail()`
		'test(t => { try { foo(); } catch (error) { t.is(error.message, "expected"); } });',
		// Try/finally without catch
		'test(t => { try { foo(); } finally { cleanup(); } });',
		// `t.fail()` inside a nested arrow function, not a direct statement
		'test(t => { try { foo(() => { t.fail(); }); } catch (error) { t.pass(); } });',
		// `t.fail()` inside a nested function expression, not a direct statement
		'test(t => { try { foo(function() { t.fail(); }); } catch (error) { t.pass(); } });',
		// `t.fail()` only in catch block, not in try block
		'test(t => { try { foo(); } catch (error) { t.fail(); } });',
		// Not a test file
		{code: 'test(t => { try { foo(); t.fail(); } catch (error) { t.pass(); } });', noHeader: true},
		// Empty try block
		'test(t => { try {} catch (error) { t.pass(); } });',
		// `t.fail()` inside nested if, not a direct statement
		'test(t => { try { if (true) { t.fail(); } } catch (error) { t.pass(); } });',
		// `t.context.fail()` is not `t.fail()`
		'test(t => { try { foo(); t.context.fail(); } catch (error) { t.pass(); } });',
		// `t.fail()` is the only statement in try block (no throwing code before it)
		'test(t => { try { t.fail(); } catch (error) { t.pass(); } });',
		// `t.fail()` is the first statement, code follows it
		'test(t => { try { t.fail(); foo(); } catch (error) { t.pass(); } });',
		// Not a test object (`foo.fail()`)
		'test(t => { try { bar(); foo.fail(); } catch (error) { t.pass(); } });',
		// `t.fail()` inside for loop in try block, not a direct statement
		'test(t => { try { for (const x of items) { t.fail(); } } catch (error) { t.pass(); } });',
		// `t.fail()` inside switch case in try block, not a direct statement
		'test(t => { try { switch (x) { case 1: t.fail(); } } catch (error) { t.pass(); } });',
		// `t.fail()` inside while loop
		'test(t => { try { while (true) { t.fail(); } } catch (error) { t.pass(); } });',
		// `t.fail()` inside block statement (bare braces)
		'test(t => { try { { t.fail(); } } catch (error) { t.pass(); } });',
		// `t.fail()` inside nested function declaration
		'test(t => { try { function f() { t.fail(); } f(); } catch (error) { t.pass(); } });',
	],
	invalid: [
		// Basic sync
		{
			code: 'test(t => { try { foo(); t.fail(); } catch (error) { t.is(error.message, "expected"); } });',
			errors: [syncError],
		},
		// Basic async with `await` in try block
		{
			code: 'test(async t => { try { await foo(); t.fail(); } catch (error) { t.is(error.message, "expected"); } });',
			errors: [asyncError],
		},
		// With message argument to `t.fail()`
		{
			code: 'test(t => { try { foo(); t.fail("should have thrown"); } catch (error) { t.true(error instanceof Error); } });',
			errors: [syncError],
		},
		// In a hook
		{
			code: 'test.beforeEach(t => { try { setup(); t.fail(); } catch (error) { t.pass(); } });',
			errors: [syncError],
		},
		// With serial modifier
		{
			code: 'test.serial(t => { try { foo(); t.fail(); } catch (error) { t.pass(); } });',
			errors: [syncError],
		},
		// Alternative test object name (`tt`)
		{
			code: 'test(t => { try { foo(); tt.fail(); } catch (error) { tt.pass(); } });',
			errors: [syncError],
		},
		// Alternative test object name (`t1`)
		{
			code: 'test(t => { try { foo(); t1.fail(); } catch (error) { t1.pass(); } });',
			errors: [syncError],
		},
		// `t.skip.fail()`
		{
			code: 'test(t => { try { foo(); t.skip.fail(); } catch (error) { t.pass(); } });',
			errors: [syncError],
		},
		// With `t.plan()`
		{
			code: 'test(t => { t.plan(1); try { foo(); t.fail(); } catch (error) { t.is(error.code, 1); } });',
			errors: [syncError],
		},
		// Async hook with `await` in try
		{
			code: 'test.afterEach(async t => { try { await cleanup(); t.fail(); } catch (error) { t.pass(); } });',
			errors: [asyncError],
		},
		// Try/catch/finally - still flags if try has `t.fail()`
		{
			code: 'test(t => { try { foo(); t.fail(); } catch (error) { t.pass(); } finally { cleanup(); } });',
			errors: [syncError],
		},
		// `t.fail()` with dead code after it in try block
		{
			code: 'test(t => { try { foo(); t.fail(); bar(); } catch (error) { t.pass(); } });',
			errors: [syncError],
		},
		// Empty catch body
		{
			code: 'test(t => { try { foo(); t.fail(); } catch (error) {} });',
			errors: [syncError],
		},
		// Catch without binding
		{
			code: 'test(t => { try { foo(); t.fail(); } catch {} });',
			errors: [syncError],
		},
		// Async test but sync try block (no `await`) - should suggest `t.throws()`, not `t.throwsAsync()`
		{
			code: 'test(async t => { try { foo(); t.fail(); } catch (error) { t.pass(); } });',
			errors: [syncError],
		},
		// `await` only inside nested function in try - direct code is sync, so `t.throws()`
		{
			code: 'test(async t => { try { foo(async () => { await bar(); }); t.fail(); } catch (error) { t.pass(); } });',
			errors: [syncError],
		},
		// Variable declaration with `await` before `t.fail()`
		{
			code: 'test(async t => { try { const result = await fetch(url); t.fail(); } catch (error) { t.is(error.status, 404); } });',
			errors: [asyncError],
		},
		// Multiple statements before `t.fail()`
		{
			code: 'test(t => { try { setup(); foo(); bar(); t.fail(); } catch (error) { t.pass(); } });',
			errors: [syncError],
		},
		// Multiple statements with `await` before `t.fail()`
		{
			code: 'test(async t => { try { setup(); await foo(); t.fail(); } catch (error) { t.pass(); } });',
			errors: [asyncError],
		},
		// Nested try/catch both with `t.fail()` - two errors
		{
			code: 'test(async t => { try { try { await foo(); t.fail(); } catch (e) { t.pass(); } await bar(); t.fail(); } catch (e) { t.pass(); } });',
			errors: [asyncError, asyncError],
		},
		// `test.after` hook
		{
			code: 'test.after(t => { try { cleanup(); t.fail(); } catch (error) { t.pass(); } });',
			errors: [syncError],
		},
		// `test.after.always` hook
		{
			code: 'test.after.always(t => { try { cleanup(); t.fail(); } catch (error) { t.pass(); } });',
			errors: [syncError],
		},
		// `for await...of` in try block should suggest `t.throwsAsync()`
		{
			code: 'test(async t => { try { for await (const x of stream) { process(x); } t.fail(); } catch (error) { t.pass(); } });',
			errors: [asyncError],
		},
		// `await` inside regular `for...of` body (not `for await...of`) should suggest `t.throwsAsync()`
		{
			code: 'test(async t => { try { for (const x of items) { await process(x); } t.fail(); } catch (error) { t.pass(); } });',
			errors: [asyncError],
		},
		// Multiple independent try/catch blocks - each flagged separately
		{
			code: 'test(t => { try { foo(); t.fail(); } catch (error) { t.pass(); } try { bar(); t.fail(); } catch (error) { t.pass(); } });',
			errors: [syncError, syncError],
		},
	],
});

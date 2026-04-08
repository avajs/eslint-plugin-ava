import tsParser from '@typescript-eslint/parser';
import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/prefer-async-await.js';

const ruleTester = new RuleTester();

const errors = [{
	messageId: 'prefer-async-await',
}];

ruleTester.run('prefer-async-await', rule, {
	valid: [
		'test(t => { t.is(1, 1); });',
		'test(t => { foo(); });',
		'test(t => { return foo(); });',
		'test(t => { foo().then(fn); });',
		'test(t => { function foo() { return foo().then(fn); } });',
		// Nested arrow function returning a Promise should not be flagged
		'test(t => { const foo = () => { return bar().then(fn); }; t.pass(); });',
		// Nested function expression returning a Promise should not be flagged
		'test(t => { const foo = function() { return bar().then(fn); }; t.pass(); });',
		// Nested IIFE with .then() should not be flagged
		'test(t => { (function() { return bar().then(fn); })(); t.pass(); });',
		'test(t => foo().then(fn));',
		{
			code: 'test(t => { const bar = foo(); return bar; });',
			name: 'returned-var-not-from-then',
		},
		'test(t => { return; });',
		// Variable not assigned from .then()
		'test(t => { let bar; bar = foo().then(fn); return; });',
		'import macro from "./macro.js"; test(macro, callback => callback().then(fn));',
		'import macro from "./macro.js"; test(macro, {exec(value) { return value().then(fn); }});',
		'const macro = t => {}; test(macro, {exec(t) { return foo().then(fn); }});',
		'const implementation = {exec(t) { return foo().then(fn); }}; test(implementation);',
		// Shouldn't be triggered since it's not a test file
		{code: 'test(t => { return foo().then(fn); });', noHeader: true},
	],
	invalid: [
		{
			code: 'test(t => { return foo().then(fn); });',
			errors,
		},
		{
			code: 'test(function(t) { return foo().then(fn); });',
			errors,
		},
		{
			code: 'test(t => { return foo().then(fn).catch(fn2); });',
			errors,
		},
		{
			code: 'test(t => { return foo().catch(fn2).then(fn); });',
			errors,
		},
		{
			code: 'test(t => { const bar = foo(); return bar.then(fn); });',
			errors,
		},
		{
			code: 'test(t => { const bar = foo().then(fn); return bar; });',
			errors,
		},
		{
			code: 'test(t => { return promise?.then(fn); });',
			errors,
		},
		{
			code: 'test(t => { return foo?.().then(fn); });',
			errors,
		},
		{
			code: 'test(t => { return foo?.().then(fn).catch(fn2); });',
			errors,
		},
		{
			code: 'test(t => { return foo?.bar().then(fn); });',
			errors,
		},
		{
			code: 'test(t => { return foo?.bar()?.then(fn); });',
			errors,
		},
		{
			code: 'test(t => { const bar = foo?.().then(fn); return bar; });',
			errors,
		},
		{
			code: 'test(t => { console.log("hi"); const bar = foo().then(fn); return bar; });',
			errors,
			name: 'non-var-statement-before-then-var',
		},
		// `test.serial` should still be flagged
		{
			code: 'test.serial(t => { return foo().then(fn); });',
			errors,
		},
		// Conditional return with .then() inside if
		{
			code: 'test(t => { if (foo) { return bar.then(() => {}); } });',
			errors,
		},
		{
			code: 'test(t => { if (condition) { const promise = foo.then(fn); return promise; } });',
			errors,
		},
		// Conditional return with .then() inside else
		{
			code: 'test(t => { if (foo) { return; } else { return bar.then(fn); } });',
			errors,
		},
		// Return with .then() inside switch case
		{
			code: 'test(t => { switch (x) { case 1: return bar.then(fn); } });',
			errors,
		},
		// Return with .then() inside try block
		{
			code: 'test(t => { try { return bar.then(fn); } catch {} });',
			errors,
		},
		// Return with .then() inside catch block
		{
			code: 'test(t => { try {} catch { return bar.then(fn); } });',
			errors,
		},
		// Return with .then() inside finally block
		{
			code: 'test(t => { try {} finally { return bar.then(fn); } });',
			errors,
		},
		// Deeply nested if
		{
			code: 'test(t => { if (a) { if (b) { return foo.then(fn); } } });',
			errors,
		},
		// Return with .then() inside for loop
		{
			code: 'test(t => { for (let i = 0; i < 10; i++) { return bar.then(fn); } });',
			errors,
		},
		// Return with .then() inside for-of loop
		{
			code: 'test(t => { for (const x of items) { return bar.then(fn); } });',
			errors,
		},
		// Return with .then() inside while loop
		{
			code: 'test(t => { while (true) { return bar.then(fn); } });',
			errors,
		},
		// Return with .then() inside labeled statement
		{
			code: 'test(t => { label: { return bar.then(fn); } });',
			errors,
		},
		// Function expression (not arrow)
		{
			code: 'test(function(t) { return foo().then(fn).then(fn2); });',
			errors,
		},
		// Returned var declared with let
		{
			code: 'test(t => { let bar = foo().then(fn); return bar; });',
			errors,
		},
		{
			code: 'test.macro({exec(t) { return foo().then(fn); }});',
			errors,
		},
		{
			code: 'test({exec(t) { return foo().then(fn); }});',
			errors,
		},
		{
			code: 'test("title", {exec(t) { return foo().then(fn); }});',
			errors,
		},
		{
			code: 'const title = getTitle(); test(title, {exec(t) { return foo().then(fn); }});',
			errors,
		},
		{
			code: 'test({exec(t, value) { return foo().then(fn); }}, 123);',
			errors,
		},
		{
			code: 'test("title", {exec(t, value) { return foo().then(fn); }}, 123);',
			errors,
		},
		{
			code: 'test.serial("title", {exec(t) { return foo().then(fn); }});',
			errors,
		},
	],
});

const typescriptRuleTester = new RuleTester({
	languageOptions: {
		parser: tsParser,
	},
});

typescriptRuleTester.run('prefer-async-await', rule, {
	valid: [],
	invalid: [
		{
			code: 'test((t => { return foo().then(fn); }) as any);',
			errors,
		},
		{
			code: 'test(\'title\', (t => { return foo().then(fn); }) as any);',
			errors,
		},
	],
});

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
		'test(t => foo().then(fn));',
		{
			code: 'test(t => { const bar = foo(); return bar; });',
			name: 'returned-var-not-from-then',
		},
		'test(t => { return; });',
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
	],
});

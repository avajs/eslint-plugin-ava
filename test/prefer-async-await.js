import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/prefer-async-await.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';
const errors = [{
	messageId: 'prefer-async-await',
}];

ruleTester.run('prefer-async-await', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test(t => { t.is(1, 1); });',
		header + 'test(t => { foo(); });',
		header + 'test(t => { return foo(); });',
		header + 'test(t => { foo().then(fn); });',
		header + 'test(t => { function foo() { return foo().then(fn); } });',
		header + 'test(t => foo().then(fn));',
		{
			code: header + 'test(t => { const bar = foo(); return bar; });',
			name: 'returned-var-not-from-then',
		},
		header + 'test(t => { return; });',
		// Shouldn't be triggered since it's not a test file
		'test(t => { return foo().then(fn); });',
	],
	invalid: [
		{
			code: header + 'test(t => { return foo().then(fn); });',
			errors,
		},
		{
			code: header + 'test(function(t) { return foo().then(fn); });',
			errors,
		},
		{
			code: header + 'test(t => { return foo().then(fn).catch(fn2); });',
			errors,
		},
		{
			code: header + 'test(t => { return foo().catch(fn2).then(fn); });',
			errors,
		},
		{
			code: header + 'test(t => { const bar = foo(); return bar.then(fn); });',
			errors,
		},
		{
			code: header + 'test(t => { const bar = foo().then(fn); return bar; });',
			errors,
		},
		{
			code: header + 'test(t => { return promise?.then(fn); });',
			errors,
		},
		{
			code: header + 'test(t => { return foo?.().then(fn); });',
			errors,
		},
		{
			code: header + 'test(t => { return foo?.().then(fn).catch(fn2); });',
			errors,
		},
		{
			code: header + 'test(t => { return foo?.bar().then(fn); });',
			errors,
		},
		{
			code: header + 'test(t => { return foo?.bar()?.then(fn); });',
			errors,
		},
		{
			code: header + 'test(t => { const bar = foo?.().then(fn); return bar; });',
			errors,
		},
		{
			code: header + 'test(t => { console.log("hi"); const bar = foo().then(fn); return bar; });',
			errors,
			name: 'non-var-statement-before-then-var',
		},
	],
});

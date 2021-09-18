const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/prefer-async-await');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true,
	},
});

const header = 'const test = require(\'ava\');\n';
const errors = [{
	message: 'Prefer using async/await instead of returning a Promise.',
}];

ruleTester.run('prefer-async-await', rule, {
	valid: [
		header + 'test(t => { t.is(1, 1); });',
		header + 'test(t => { foo(); });',
		header + 'test(t => { return foo(); });',
		header + 'test(t => { foo().then(fn); });',
		header + 'test(t => { function foo() { return foo().then(fn); } });',
		header + 'test(t => foo().then(fn));',
		// TODO: this should be an error, needs improvement
		header + 'test(t => { const bar = foo().then(fn); return bar; });',
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
	],
});

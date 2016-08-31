import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-async-fn-without-await';

const ruleTester = avaRuleTester(test, {
	parser: 'babel-eslint',
	env: {
		es6: true
	}
});

const error = {
	ruleId: 'no-async-fn-without-await',
	message: 'Function was declared as `async` but doesn\'t use `await`'
};
const header = `const test = require('ava');\n`;

ruleTester.run('no-async-fn-without-await', rule, {
	valid: [
		`${header} test(fn);`,
		`${header} test(t => {});`,
		`${header} test(function(t) {});`,
		`${header} test(async t => { await foo(); });`,
		`${header} test(async t => { t.is(await foo(), 1); });`,
		`${header} test(async function(t) { await foo(); });`,
		`${header} test(async t => { if (bar) { await foo(); } });`,
		`${header} test(async t => { if (bar) {} else { await foo(); } });`,
		// shouldn't be triggered since it's not a test file
		'test(async t => {});'
	],
	invalid: [
		{
			code: `${header} test(async t => {});`,
			errors: [error]
		},
		{
			code: `${header} test(async function(t) {});`,
			errors: [error]
		},
		{
			code: `${header} test(async t => {}); test(async t => {});`,
			errors: [error, error]
		},
		{
			code: `${header} test(async t => {}); test(async t => { await foo(); });`,
			errors: [error]
		},
		{
			code: `${header} test(async t => { await foo(); }); test(async t => {});`,
			errors: [error]
		}
	]
});

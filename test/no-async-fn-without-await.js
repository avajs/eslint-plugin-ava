import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-async-fn-without-await.js';

const message = 'Function was declared as `async` but doesn\'t use `await`.';
const header = 'const test = require(\'ava\');\n';

const ruleTesterOptions = [
	{
		languageOptions: {
			ecmaVersion: 'latest',
		},
	},
	// Disabled for now because of `eslint-ava-rule-tester` problem
	// {
	// 	parser: require.resolve('babel-eslint'),
	// 	env: {
	// 		es6: true
	// 	}
	// }
];

for (const options of ruleTesterOptions) {
	const ruleTester = new AvaRuleTester(test, options);

	ruleTester.run(`no-async-fn-without-await - parser:${options.parser ?? 'default'}`, rule, {
		assertionOptions: {
			requireMessage: true,
		},
		valid: [
			`${header}test(fn);`,
			`${header}test(t => {});`,
			`${header}test(function(t) {});`,
			`${header}test(async t => { await foo(); });`,
			`${header}test(async t => { t.is(await foo(), 1); });`,
			`${header}test(async function(t) { await foo(); });`,
			`${header}test(async t => { if (bar) { await foo(); } });`,
			`${header}test(async t => { if (bar) {} else { await foo(); } });`,
			`${header}test(async t => { for await (const foo of bar) {} });`,
			`${header}test.after(async () => { await foo(); });`,
			`${header}test('title', fn);`,
			`${header}test('title', function(t) {});`,
			`${header}test('title', async t => { await foo(); });`,
			// Shouldn't be triggered since it's not a test file
			'test(async t => {});',
		],
		invalid: [
			{
				code: `${header}test(async t => {});`,
				errors: [{
					message,
					line: 2,
					column: 6,
				}],
			},
			{
				code: `${header}test(async function(t) {});`,
				errors: [{
					message,
					line: 2,
					column: 6,
				}],
			},
			{
				code: `${header}test(async t => {}); test(async t => {});`,
				errors: [{
					message,
					line: 2,
					column: 6,
				}, {
					message,
					line: 2,
					column: 27,
				}],
			},
			{
				code: `${header}test(async t => {}); test(async t => { await foo(); });`,
				errors: [{
					message,
					line: 2,
					column: 6,
				}],
			},
			{
				code: `${header}test(async t => { await foo(); }); test(async t => {});`,
				errors: [{
					message,
					line: 2,
					column: 41,
				}],
			},
			{
				code: `${header}test('title', async t => {});`,
				errors: [{
					message,
					line: 2,
					column: 15,
				}],
			},
		],
	});
}

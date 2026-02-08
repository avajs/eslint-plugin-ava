import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-async-fn-without-await.js';

const messageId = 'no-async-fn-without-await';

const ruleTester = new RuleTester();

ruleTester.run('no-async-fn-without-await', rule, {
	valid: [
		'test(fn);',
		'test(t => {});',
		'test(function(t) {});',
		'test(async t => { await foo(); });',
		'test(async t => { t.is(await foo(), 1); });',
		'test(async function(t) { await foo(); });',
		'test(async t => { if (bar) { await foo(); } });',
		'test(async t => { if (bar) {} else { await foo(); } });',
		'test(async t => { for await (const foo of bar) {} });',
		'test.after(async () => { await foo(); });',
		'test(\'title\', fn);',
		'test(\'title\', function(t) {});',
		'test(\'title\', async t => { await foo(); });',
		// Shouldn't be triggered since it's not a test file
		{code: 'test(async t => {});', noHeader: true},
	],
	invalid: [
		{
			code: 'test(async t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [{
					messageId: 'no-async-fn-without-await-suggestion',
					output: 'test(t => {});',
				}],
			}],
		},
		{
			code: 'test(async function(t) {});',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [{
					messageId: 'no-async-fn-without-await-suggestion',
					output: 'test(function(t) {});',
				}],
			}],
		},
		{
			code: 'test(async t => {}); test(async t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [{
					messageId: 'no-async-fn-without-await-suggestion',
					output: 'test(t => {}); test(async t => {});',
				}],
			}, {
				messageId,
				line: 2,
				column: 27,
				suggestions: [{
					messageId: 'no-async-fn-without-await-suggestion',
					output: 'test(async t => {}); test(t => {});',
				}],
			}],
		},
		{
			code: 'test(async t => {}); test(async t => { await foo(); });',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [{
					messageId: 'no-async-fn-without-await-suggestion',
					output: 'test(t => {}); test(async t => { await foo(); });',
				}],
			}],
		},
		{
			code: 'test(async t => { await foo(); }); test(async t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 41,
				suggestions: [{
					messageId: 'no-async-fn-without-await-suggestion',
					output: 'test(async t => { await foo(); }); test(t => {});',
				}],
			}],
		},
		{
			code: 'test(\'title\', async t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 15,
				suggestions: [{
					messageId: 'no-async-fn-without-await-suggestion',
					output: 'test(\'title\', t => {});',
				}],
			}],
		},
	],
});

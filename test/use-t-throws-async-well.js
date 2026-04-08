import tsParser from '@typescript-eslint/parser';
import RuleTester, {testCase, asyncTestCase} from './helpers/rule-tester.js';
import rule from '../rules/use-t-throws-async-well.js';

const ruleTester = new RuleTester();

ruleTester.run('use-t-throws-async-well', rule, {
	valid: [
		asyncTestCase('await t.throwsAsync(f)'),
		asyncTestCase('await t.notThrowsAsync(f)'),
		'test(\'title\', async t => { await t.throwsAsync(f) });',
		'test(\'title\', async t => { await t.notThrowsAsync(f) });',
		asyncTestCase('t.throwsAsync.skip(f)'),
		asyncTestCase('t.notThrowsAsync.skip(f)'),
		asyncTestCase('t.throws(f)'),
		asyncTestCase('t.notThrows(f)'),
		asyncTestCase('t.context.helpers.throwsAsync(f)'),
		asyncTestCase('t.context.notThrowsAsync(f)'),
		asyncTestCase('f(t.throwsAsync(f))'),
		asyncTestCase('let p = t.throwsAsync(f)'),
		asyncTestCase('p = t.throwsAsync(f)'),
		{code: asyncTestCase('t.throwsAsync(f)'), noHeader: true}, // Shouldn't be triggered since it's not a test file
		{code: testCase('t.throwsAsync(f)'), noHeader: true}, // Shouldn't be triggered since it's not a test file
	],
	invalid: [
		{
			code: testCase('t.throwsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: testCase('t.notThrowsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: asyncTestCase('t.throwsAsync(f)'),
			output: asyncTestCase('await t.throwsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: asyncTestCase('t.notThrowsAsync(f)'),
			output: asyncTestCase('await t.notThrowsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		// Alternative test object names for t.try() callbacks
		{
			code: asyncTestCase('tt.throwsAsync(f)'),
			output: asyncTestCase('await tt.throwsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		// Titled tests: sync (no fix), async (fix applied)
		{
			code: 'test(\'title\', t => { t.throwsAsync(f); });',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: 'test(\'title\', t => { t.notThrowsAsync(f); });',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: 'test(\'title\', async t => { t.throwsAsync(f); });',
			output: 'test(\'title\', async t => { await t.throwsAsync(f); });',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: 'test(\'title\', async t => { t.notThrowsAsync(f); });',
			output: 'test(\'title\', async t => { await t.notThrowsAsync(f); });',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: 'test(\'title\', {exec: async t => { t.throwsAsync(f); }});',
			output: 'test(\'title\', {exec: async t => { await t.throwsAsync(f); }});',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: 'test(\'title\', {exec: async (t, value) => { t.notThrowsAsync(f); }}, 1);',
			output: 'test(\'title\', {exec: async (t, value) => { await t.notThrowsAsync(f); }}, 1);',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
	],
});

const typescriptRuleTester = new RuleTester({
	languageOptions: {
		parser: tsParser,
	},
});

typescriptRuleTester.run('use-t-throws-async-well', rule, {
	valid: [
		'test((async t => { await t.throwsAsync(f); }) as any);',
		'test(\'title\', (async t => { await t.throwsAsync(f); }) as any);',
		'test((async t => { await t.notThrowsAsync(f); }) as any);',
		'test(\'title\', (async t => { await t.notThrowsAsync(f); }) as any);',
	],
	invalid: [
		{
			code: 'test((async t => { t.throwsAsync(f); }) as any);',
			output: 'test((async t => { await t.throwsAsync(f); }) as any);',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: 'test(\'title\', (async t => { t.throwsAsync(f); }) as any);',
			output: 'test(\'title\', (async t => { await t.throwsAsync(f); }) as any);',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: 'test((async t => { t.notThrowsAsync(f); }) as any);',
			output: 'test((async t => { await t.notThrowsAsync(f); }) as any);',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: 'test(\'title\', (async t => { t.notThrowsAsync(f); }) as any);',
			output: 'test(\'title\', (async t => { await t.notThrowsAsync(f); }) as any);',
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
	],
});

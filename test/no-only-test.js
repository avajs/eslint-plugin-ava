import RuleTester from './helpers/rule-tester.js';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/no-only-test.js';

const ruleTester = new RuleTester();

const typescriptRuleTester = new RuleTester({
	languageOptions: {
		parser: tsParser,
	},
});

const messageId = 'no-only-test';
const tsHeader = 'import anyTest from \'ava\';\nconst test = anyTest as any;\n';

ruleTester.run('no-only-test', rule, {
	valid: [
		'test("my test name", t => { t.pass(); });',
		'test(t => { t.pass(); }); test(t => { t.pass(); });',
		'notTest.only();',
		// Shouldn't be triggered since it's not a test file
		{code: 'test.only(t => {});', noHeader: true},
	],
	invalid: [
		{
			code: 'test\n\t.only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 3,
				column: 3,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: 'test\n\t(t => { t.pass(); });',
				}],
			}],
		},
		{
			code: 'test\n  .only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 3,
				column: 4,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: 'test\n  (t => { t.pass(); });',
				}],
			}],
		},
		{
			code: 'test\t.only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 7,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: 'test\t(t => { t.pass(); });',
				}],
			}],
		},
		{
			code: 'test  .only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 8,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: 'test  (t => { t.pass(); });',
				}],
			}],
		},
		{
			code: 'test.\n\tonly(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 3,
				column: 2,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: 'test\n\t(t => { t.pass(); });',
				}],
			}],
		},
		{
			code: 'test.\n  only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 3,
				column: 3,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: 'test\n  (t => { t.pass(); });',
				}],
			}],
		},
		{
			code: 'test.only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: 'test(t => { t.pass(); });',
				}],
			}],
		},
	],
});

// TypeScript: `import anyTest from 'ava'; const test = anyTest as TestFn<Context>;`
typescriptRuleTester.run('no-only-test-ts', rule, {
	valid: [
		{name: 'ts: no only', code: tsHeader + 'test("my test name", t => { t.pass(); });', noHeader: true},
	],
	invalid: [
		{
			name: 'ts: test.only detected',
			noHeader: true,
			code: tsHeader + 'test.only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 3,
				column: 6,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: tsHeader + 'test(t => { t.pass(); });',
				}],
			}],
		},
	],
});

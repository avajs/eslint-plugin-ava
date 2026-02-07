import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/no-only-test.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
});

const typescriptRuleTester = new AvaRuleTester(test, {
	languageOptions: {
		parser: tsParser,
	},
});

const messageId = 'no-only-test';
const header = 'const test = require(\'ava\');\n';
const tsHeader = 'import anyTest from \'ava\';\nconst test = anyTest as any;\n';

ruleTester.run('no-only-test', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + 'test(t => { t.pass(); }); test(t => { t.pass(); });',
		header + 'notTest.only();',
		// Shouldn't be triggered since it's not a test file
		'test.only(t => {});',
	],
	invalid: [
		{
			code: header + 'test\n\t.only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 3,
				column: 3,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: header + 'test\n\t(t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test\n  .only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 3,
				column: 4,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: header + 'test\n  (t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test\t.only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 7,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: header + 'test\t(t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test  .only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 8,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: header + 'test  (t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test.\n\tonly(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 3,
				column: 2,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: header + 'test\n\t(t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test.\n  only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 3,
				column: 3,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: header + 'test\n  (t => { t.pass(); });',
				}],
			}],
		},
		{
			code: header + 'test.only(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [{
					messageId: 'no-only-test-suggestion',
					output: header + 'test(t => { t.pass(); });',
				}],
			}],
		},
	],
});

// TypeScript: `import anyTest from 'ava'; const test = anyTest as TestFn<Context>;`
typescriptRuleTester.run('no-only-test-ts', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		{name: 'ts: no only', code: tsHeader + 'test("my test name", t => { t.pass(); });'},
	],
	invalid: [
		{
			name: 'ts: test.only detected',
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

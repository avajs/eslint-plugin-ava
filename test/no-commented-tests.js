import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-commented-tests.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const messageId = 'no-commented-tests';
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-commented-tests', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		// Normal test calls
		header + 'test("my test name", t => { t.pass(); });',
		// Regular comments mentioning "test" but not test calls
		{
			code: header + '// Run the tests\ntest("my test name", t => { t.pass(); });',
			name: 'comment about running tests',
		},
		// Comment with test not at start of line
		{
			code: header + '// Some info about test() usage\ntest("my test name", t => { t.pass(); });',
			name: 'test mentioned mid-sentence',
		},
		// Not a test file (no AVA import)
		'// test("foo", t => { t.pass(); });',
		// Similar word but not "test"
		{
			code: header + '// testing("foo", t => { t.pass(); });\ntest("my test name", t => { t.pass(); });',
			name: 'testing() not test()',
		},
		// Comment with test as part of another word
		{
			code: header + '// contest("foo", t => { t.pass(); });\ntest("my test name", t => { t.pass(); });',
			name: 'contest() not test()',
		},
		// Comment starting with "test" but without ()
		{
			code: header + '// test without calling it\ntest("my test name", t => { t.pass(); });',
			name: 'test at start but no parentheses',
		},
	],
	invalid: [
		{
			code: header + '// test(\'foo\', t => {\ntest("my test name", t => { t.pass(); });',
			errors: [{messageId, line: 2}],
		},
		{
			code: header + '//test(\'foo\', t => {\ntest("my test name", t => { t.pass(); });',
			errors: [{messageId, line: 2}],
			name: 'no space after //',
		},
		{
			code: header + '// test.skip(\'foo\', t => {\ntest("my test name", t => { t.pass(); });',
			errors: [{messageId, line: 2}],
		},
		{
			code: header + '// test.only(\'foo\', t => {\ntest("my test name", t => { t.pass(); });',
			errors: [{messageId, line: 2}],
		},
		{
			code: header + '// test.serial.skip(\'foo\', t => {\ntest("my test name", t => { t.pass(); });',
			errors: [{messageId, line: 2}],
		},
		{
			code: header + '/* test(\'foo\', t => { t.pass(); }) */\ntest("my test name", t => { t.pass(); });',
			errors: [{messageId, line: 2}],
		},
		{
			code: header + '/*\n * test(\'foo\', t => {\n */\ntest("my test name", t => { t.pass(); });',
			errors: [{messageId, line: 3}],
		},
		{
			code: header + '// test.before(t => {\ntest("my test name", t => { t.pass(); });',
			errors: [{messageId, line: 2}],
		},
		{
			code: header + '// test(\'a\', t => {});\ntest("my test name", t => { t.pass(); });\n// test(\'b\', t => {});',
			errors: [{messageId, line: 2}, {messageId, line: 4}],
			name: 'multiple commented-out tests',
		},
	],
});

import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-commented-tests.js';

const ruleTester = new RuleTester();

const messageId = 'no-commented-tests';
const passingTest = 'test("my test name", t => { t.pass(); });';

ruleTester.run('no-commented-tests', rule, {
	valid: [
		// Normal test calls
		passingTest,
		// Regular comments mentioning "test" but not test calls
		{
			code: `// Run the tests\n${passingTest}`,
			name: 'comment about running tests',
		},
		// Comment with test not at start of line
		{
			code: `// Some info about test() usage\n${passingTest}`,
			name: 'test mentioned mid-sentence',
		},
		// Not a test file (no AVA import)
		{code: '// test("foo", t => { t.pass(); });', noHeader: true},
		// Similar word but not "test"
		{
			code: `// testing("foo", t => { t.pass(); });\n${passingTest}`,
			name: 'testing() not test()',
		},
		// Comment with test as part of another word
		{
			code: `// contest("foo", t => { t.pass(); });\n${passingTest}`,
			name: 'contest() not test()',
		},
		// Comment starting with "test" but without ()
		{
			code: `// test without calling it\n${passingTest}`,
			name: 'test at start but no parentheses',
		},
	],
	invalid: [
		{
			code: `// test('foo', t => {\n${passingTest}`,
			errors: [{messageId, line: 2}],
		},
		{
			code: `//test('foo', t => {\n${passingTest}`,
			errors: [{messageId, line: 2}],
			name: 'no space after //',
		},
		{
			code: `// test.skip('foo', t => {\n${passingTest}`,
			errors: [{messageId, line: 2}],
		},
		{
			code: `// test.only('foo', t => {\n${passingTest}`,
			errors: [{messageId, line: 2}],
		},
		{
			code: `// test.serial.skip('foo', t => {\n${passingTest}`,
			errors: [{messageId, line: 2}],
		},
		{
			code: `/* test('foo', t => { t.pass(); }) */\n${passingTest}`,
			errors: [{messageId, line: 2}],
		},
		{
			code: `/*\n * test('foo', t => {\n */\n${passingTest}`,
			errors: [{messageId, line: 3}],
		},
		{
			code: `// test.before(t => {\n${passingTest}`,
			errors: [{messageId, line: 2}],
		},
		{
			code: `// test('a', t => {});\n${passingTest}\n// test('b', t => {});`,
			errors: [{messageId, line: 2}, {messageId, line: 4}],
			name: 'multiple commented-out tests',
		},
	],
});

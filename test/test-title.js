import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/test-title.js';

const ruleTester = new RuleTester();

const missingErrors = [{messageId: 'test-title'}];
const nonStringErrors = [{messageId: 'non-string-title'}];
const emptyErrors = [{messageId: 'empty-title'}];
const whitespaceErrors = [{messageId: 'title-whitespace'}];
const escapedTabPrefix = String.raw`\tfoo `;

ruleTester.run('test-title', rule, {
	valid: [
		'test("my test name", t => { t.pass(); t.end(); });',
		'test(`my test name`, t => { t.pass(); t.end(); });',
		'test(\'my test name\', t => { t.pass(); t.end(); });',
		'test.todo("my test name");',
		// eslint-disable-next-line no-template-curly-in-string
		'test(`${dynamicTitle}`, t => { t.pass(); });',
		// eslint-disable-next-line no-template-curly-in-string
		'test(`prefix ${dynamicTitle}`, t => { t.pass(); });',
		'test.before(t => {});',
		'test.after(t => {});',
		'test.beforeEach(t => {});',
		'test.afterEach(t => {});',
		'test.macro(t => {});',
		'notTest(t => { t.pass(); t.end(); });',
		'test([], arg1, arg2);',
		'test({}, arg1, arg2);',
		// Variable/expression titles are OK (can't statically determine)
		'test(title, t => { t.pass(); });',
		// Shouldn't be triggered since it's not a test file
		{code: 'test(t => {});', noHeader: true},
	],
	invalid: [
		// Missing title
		{
			code: 'test(t => {});',
			errors: missingErrors,
		},
		{
			code: 'test(t => {}, "my test name");',
			errors: missingErrors,
		},
		{
			code: 'test(t => { t.pass(); t.end(); });',
			errors: missingErrors,
		},
		{
			code: 'test.todo();',
			errors: missingErrors,
		},
		// Non-string title
		{
			code: 'test(123, t => { t.pass(); });',
			errors: nonStringErrors,
		},
		{
			code: 'test(true, t => { t.pass(); });',
			errors: nonStringErrors,
		},
		{
			code: 'test(null, t => { t.pass(); });',
			errors: nonStringErrors,
		},
		{
			code: 'test.todo(123);',
			errors: nonStringErrors,
		},
		// Empty title
		{
			code: 'test("", t => { t.pass(); });',
			errors: emptyErrors,
		},
		{
			code: 'test.todo("");',
			errors: emptyErrors,
		},
		{
			code: 'test(``, t => { t.pass(); });',
			errors: emptyErrors,
		},
		{
			code: 'test("   ", t => { t.pass(); });',
			errors: emptyErrors,
		},
		// Whitespace in title
		{
			code: 'test(" foo ", t => { t.pass(); });',
			output: 'test("foo", t => { t.pass(); });',
			errors: whitespaceErrors,
		},
		{
			code: 'test(\' foo \', t => { t.pass(); });',
			output: 'test("foo", t => { t.pass(); });',
			errors: whitespaceErrors,
		},
		{
			code: 'test(" foo", t => { t.pass(); });',
			output: 'test("foo", t => { t.pass(); });',
			errors: whitespaceErrors,
		},
		{
			code: 'test("foo ", t => { t.pass(); });',
			output: 'test("foo", t => { t.pass(); });',
			errors: whitespaceErrors,
		},
		{
			code: 'test(` foo `, t => { t.pass(); });',
			output: 'test("foo", t => { t.pass(); });',
			errors: whitespaceErrors,
		},
		{
			code: 'test.todo(" foo ");',
			output: 'test.todo("foo");',
			errors: whitespaceErrors,
		},
		{
			code: String.raw`test('\tfoo ', t => { t.pass(); });`,
			output: 'test("foo", t => { t.pass(); });',
			errors: whitespaceErrors,
		},
		{
			code: `test(\`${escapedTabPrefix}\`, t => { t.pass(); });`,
			output: 'test("foo", t => { t.pass(); });',
			errors: whitespaceErrors,
		},
	],
});

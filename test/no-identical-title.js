import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-identical-title.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const messageId = 'no-identical-title';

const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-identical-title', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test("my test name", t => {});',
		header + 'test("a", t => {}); test("b", t => {});',
		header + 'test.todo("a"); test.todo("b");',
		header + 'test("a", t => {}); notTest("a", t => {});',
		// eslint-disable-next-line no-template-curly-in-string
		header + 'test(`foo ${name}`, t => {}); test(`foo ${name}`,  t => {});',
		header + 'const name = "foo"; test(name + " 1", t => {}); test(name + " 1", t => {});',
		header + 'notTest("a", t => {}); notTest("a", t => {});',
		header + 'test.before(t => {}); test.before(t => {});',
		header + 'test.after(t => {}); test.after(t => {});',
		header + 'test.beforeEach(t => {}); test.beforeEach(t => {});',
		header + 'test.afterEach(t => {}); test.afterEach(t => {});',
		// Macros
		` ${header}
			const macro = (t, value) => { t.true(value); };

			test(macro, true);
			test('should work', macro, true);
			test('should fail', macro, false);
		`,
		` ${header}
			const macro = (t, value) => { t.true(value); };

			test('same title', macro, true);
			test('same title', macro, false);
		`,
		header + 'test(t => {}); test(t => {});',
		// Shouldn't be triggered since it's not a test file
		'test(t => {}); test(t => {});',
		'test("a", t => {}); test("a", t => {});',
	],
	invalid: [
		{
			code: header + 'test("a", t => {}); test("a", t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 26,
			}],
		},
		{
			code: header + 'test(`a`, t => {}); test(`a`, t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 26,
			}],
		},
		{
			code: header + 'test("foo" + 1, t => {}); test("foo" + 1, t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 32,
			}],
		},
		{
			// eslint-disable-next-line no-template-curly-in-string
			code: header + 'test(`${"foo" + 1}`, t => {}); test(`${"foo" + 1}`, t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 37,
			}],
		},
		{
			code: header + 'test.todo("a"); test.todo("a");',
			errors: [{
				messageId,
				line: 2,
				column: 27,
			}],
		},
	],
});

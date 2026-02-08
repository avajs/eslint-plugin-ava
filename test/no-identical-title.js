import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-identical-title.js';

const ruleTester = new RuleTester();

const messageId = 'no-identical-title';

ruleTester.run('no-identical-title', rule, {
	valid: [
		'test("my test name", t => {});',
		'test("a", t => {}); test("b", t => {});',
		'test.todo("a"); test.todo("b");',
		'test("a", t => {}); notTest("a", t => {});',
		// eslint-disable-next-line no-template-curly-in-string
		'test(`foo ${name}`, t => {}); test(`foo ${name}`,  t => {});',
		'const name = "foo"; test(name + " 1", t => {}); test(name + " 1", t => {});',
		'notTest("a", t => {}); notTest("a", t => {});',
		'test.before(t => {}); test.before(t => {});',
		'test.after(t => {}); test.after(t => {});',
		'test.beforeEach(t => {}); test.beforeEach(t => {});',
		'test.afterEach(t => {}); test.afterEach(t => {});',
		// Macros
		`
			const macro = (t, value) => { t.true(value); };

			test(macro, true);
			test('should work', macro, true);
			test('should fail', macro, false);
		`,
		`
			const macro = (t, value) => { t.true(value); };

			test('same title', macro, true);
			test('same title', macro, false);
		`,
		'test(t => {}); test(t => {});',
		// Shouldn't be triggered since it's not a test file
		{code: 'test(t => {}); test(t => {});', noHeader: true},
		{code: 'test("a", t => {}); test("a", t => {});', noHeader: true},
	],
	invalid: [
		{
			code: 'test("a", t => {}); test("a", t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 26,
			}],
		},
		{
			code: 'test(`a`, t => {}); test(`a`, t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 26,
			}],
		},
		{
			code: 'test("foo" + 1, t => {}); test("foo" + 1, t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 32,
			}],
		},
		{
			// eslint-disable-next-line no-template-curly-in-string
			code: 'test(`${"foo" + 1}`, t => {}); test(`${"foo" + 1}`, t => {});',
			errors: [{
				messageId,
				line: 2,
				column: 37,
			}],
		},
		{
			code: 'test.todo("a"); test.todo("a");',
			errors: [{
				messageId,
				line: 2,
				column: 27,
			}],
		},
	],
});

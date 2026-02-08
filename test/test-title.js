import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/test-title.js';

const ruleTester = new RuleTester();

const errors = [{messageId: 'test-title'}];

ruleTester.run('test-title', rule, {
	valid: [
		'test("my test name", t => { t.pass(); t.end(); });',
		'test(`my test name`, t => { t.pass(); t.end(); });',
		'test(\'my test name\', t => { t.pass(); t.end(); });',
		'test.todo("my test name");',
		'test.before(t => {});',
		'test.after(t => {});',
		'test.beforeEach(t => {});',
		'test.afterEach(t => {});',
		'test.macro(t => {});',
		'notTest(t => { t.pass(); t.end(); });',
		'test([], arg1, arg2);',
		'test({}, arg1, arg2);',
		// Shouldn't be triggered since it's not a test file
		{code: 'test(t => {});', noHeader: true},
	],
	invalid: [
		{
			code: 'test(t => {});',
			errors,
		},
		{
			code: 'test(t => {}, "my test name");',
			errors,
		},
		{
			code: 'test(t => { t.pass(); t.end(); });',
			errors,
		},
		{
			code: 'test.todo();',
			errors,
		},
	],
});

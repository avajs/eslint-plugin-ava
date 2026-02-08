import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-nested-tests.js';

const ruleTester = new RuleTester();

const error = {
	messageId: 'no-nested-tests',
};

ruleTester.run('no-nested-tests', rule, {
	valid: [
		'test(t => {});',
		'test("title", t => {});',
		'test(t => {}); test(t => {});',
		'test("title", t => {}); test("title", t => {});',
		'test.skip(t => {});',
		'test.skip(t => {}); test.skip(t => {});',
		'test.only(t => {});',
		'test.only(t => {}); test.only(t => {});',
		// Shouldn't be triggered since it's not a test file
		{code: 'test(t => { test(t => {}); });', noHeader: true},
	],
	invalid: [
		{
			code: 'test("2", t => { test(t => {}); });',
			errors: [error],
		},
		{
			code: 'test(t => { test(t => {}); test(t => {}); });',
			errors: [error, error],
		},
		{
			code: 'test(t => { test(t => { test(t => {}); }); });',
			errors: [error, error],
		},
	],
});

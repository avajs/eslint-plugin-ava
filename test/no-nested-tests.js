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
		{
			// The standalone test after the nested pair must not be a false positive
			code: 'test(t => { test(t => {}); }); test(t => {});',
			errors: [error],
		},
		{
			// Multiple subsequent tests after a nested pair must not be false positives
			code: 'test(t => { test(t => {}); }); test(t => {}); test(t => {});',
			errors: [error],
		},
		{
			// Two sequential nested pairs followed by a valid test must not accumulate state
			code: 'test(t => { test(t => {}); }); test(t => { test(t => {}); }); test(t => {});',
			errors: [error, error],
		},
	],
});

import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-nested-assertions.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';
const error = {
	messageId: 'no-nested-assertions',
};

ruleTester.run('no-nested-assertions', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		// Sequential assertions
		header + 'test(t => { t.is(1, 1); t.true(true); });',
		// Assertions in t.try() callback are fine
		header + 'test(t => { t.try(tt => { tt.is(1, 1); }); });',
		// Multiple assertions in t.try() callback are fine
		header + 'test(t => { t.try(tt => { tt.is(1, 1); tt.true(true); }); });',
		// Non-assertion methods
		header + 'test(t => { t.plan(1); t.is(1, 1); });',
		// Not a test object
		header + 'test(t => { foo.is(t.is(1, 1)); });',
		// Shouldn't be triggered since it's not a test file
		'test(t => { t.is(t.throws(fn).message, "expected"); });',
	],
	invalid: [
		// Assertion as argument to another assertion
		{
			code: header + 'test(t => { t.is(t.throws(fn).message, "expected"); });',
			errors: [error],
		},
		{
			code: header + 'test(t => { t.true(t.throws(fn).message); });',
			errors: [error],
		},
		{
			code: header + 'test(t => { t.deepEqual(t.throws(fn), expected); });',
			errors: [error],
		},
		// Assertion inside t.throws() callback
		{
			code: header + 'test(t => { t.throws(() => { t.is(1, 2); }); });',
			errors: [error],
		},
		// Assertion inside t.throwsAsync() callback
		{
			code: header + 'test(t => { t.throwsAsync(() => { t.true(false); }); });',
			errors: [error],
		},
		// Assertion inside t.notThrows() callback
		{
			code: header + 'test(t => { t.notThrows(() => { t.pass(); }); });',
			errors: [error],
		},
		// Assertion inside t.notThrowsAsync() callback
		{
			code: header + 'test(t => { t.notThrowsAsync(() => { t.true(true); }); });',
			errors: [error],
		},
		// Multiple assertions inside t.throws() callback
		{
			code: header + 'test(t => { t.throws(() => { t.is(1, 2); t.true(false); }); });',
			errors: [error, error],
		},
		// Deeply nested
		{
			code: header + 'test(t => { t.is(t.throws(() => { t.pass(); }).message, "x"); });',
			errors: [error, error],
		},
		// With .skip modifier
		{
			code: header + 'test(t => { t.is(t.throws.skip(fn).message, "expected"); });',
			errors: [error],
		},
		// Nesting within t.try() callback is still caught
		{
			code: header + 'test(t => { t.try(tt => { tt.is(tt.throws(fn).message, "expected"); }); });',
			errors: [error],
		},
		// Alternative test object names
		{
			code: header + 'test(t => { tt.is(tt.throws(fn).message, "expected"); });',
			errors: [error],
		},
	],
});

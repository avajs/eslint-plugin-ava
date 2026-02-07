import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-unknown-modifiers.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-unknown-modifiers', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		`${header}test(t => {});`,
		`${header}test.after(t => {});`,
		`${header}test.afterEach(t => {});`,
		`${header}test.before(t => {});`,
		`${header}test.beforeEach(t => {});`,
		`${header}test.default(t => {});`,
		`${header}test.default.serial(t => {});`,
		`${header}test.only(t => {});`,
		`${header}test.serial(t => {});`,
		`${header}test.skip(t => {});`,
		`${header}test.todo(t => {});`,
		`${header}test.after.always(t => {});`,
		`${header}test.afterEach.always(t => {});`,
		`${header}test.failing(t => {});`,
		`${header}test.macro(t => {});`,
		// Shouldn't be triggered since it's not a test file
		'test.foo(t => {});',
	],
	invalid: [
		{
			code: `${header}test.foo(t => {});`,
			errors: [{
				messageId: 'no-unknown-modifiers',
				line: 2,
				column: 6,
			}],
		},
		{
			code: `${header}test.onlu(t => {});`,
			errors: [{
				messageId: 'no-unknown-modifiers',
				line: 2,
				column: 6,
			}],
		},
		{
			code: `${header}test.beforeeach(t => {});`,
			errors: [{
				messageId: 'no-unknown-modifiers',
				line: 2,
				column: 6,
			}],
		},
		{
			code: `${header}test.c.only(t => {});`,
			errors: [{
				messageId: 'no-unknown-modifiers',
				line: 2,
				column: 6,
			}],
		},
		{
			code: `${header}test.cb(t => {});`,
			errors: [{
				messageId: 'no-unknown-modifiers',
				line: 2,
				column: 6,
			}],
		},
		{
			code: `${header}test.foo.bar.baz(t => {});`,
			errors: [{
				messageId: 'no-unknown-modifiers',
				line: 2,
				column: 6,
			}],
		},
		{
			code: `${header}test.test(t => {});`,
			errors: [{
				messageId: 'no-unknown-modifiers',
				line: 2,
				column: 6,
			}],
		},
	],
});

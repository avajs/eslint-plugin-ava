import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-unknown-modifiers';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const ruleError = {ruleId: 'no-unknown-modifiers'};
const header = `const test = require('ava');\n`;

function error(message) {
	return Object.assign({}, ruleError, {message});
}

ruleTester.run('no-unknown-modifiers', rule, {
	valid: [
		`${header} test(t => {});`,
		`${header} test.after(t => {});`,
		`${header} test.afterEach(t => {});`,
		`${header} test.before(t => {});`,
		`${header} test.beforeEach(t => {});`,
		`${header} test.cb(t => {});`,
		`${header} test.cb.only(t => {});`,
		`${header} test.only(t => {});`,
		`${header} test.serial(t => {});`,
		`${header} test.skip(t => {});`,
		`${header} test.todo(t => {});`,
		`${header} test.after.always(t => {});`,
		`${header} test.afterEach.always(t => {});`,
		`${header} test.failing(t => {});`,
		// shouldn't be triggered since it's not a test file
		`test.foo(t => {});`
	],
	invalid: [
		{
			code: `${header} test.foo(t => {});`,
			errors: [error('Unknown test modifier `foo`.')]
		},
		{
			code: `${header} test.onlu(t => {});`,
			errors: [error('Unknown test modifier `onlu`.')]
		},
		{
			code: `${header} test.beforeeach(t => {});`,
			errors: [error('Unknown test modifier `beforeeach`.')]
		},
		{
			code: `${header} test.c.only(t => {});`,
			errors: [error('Unknown test modifier `c`.')]
		},
		{
			code: `${header} test.cb.onlu(t => {});`,
			errors: [error('Unknown test modifier `onlu`.')]
		},
		{
			code: `${header} test.foo.bar.baz(t => {});`,
			errors: [error('Unknown test modifier `foo`.')]
		},
		{
			code: `${header} test.default(t => {});`,
			errors: [error('Unknown test modifier `default`.')]
		},
		{
			code: `${header} test.test(t => {});`,
			errors: [error('Unknown test modifier `test`.')]
		}
	]
});

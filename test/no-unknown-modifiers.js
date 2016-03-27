import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/no-unknown-modifiers';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const ruleError = {ruleId: 'no-unknown-modifiers'};
const header = `const test = require('ava');\n`;

test(() => {
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
			// shouldn't be triggered since it's not a test file
			`test.foo(t => {});`
		],
		invalid: [
			{
				code: `${header} test.foo(t => {});`,
				errors: [
					{...ruleError, message: 'Unknown modifier `foo`'}
				]
			},
			{
				code: `${header} test.onlu(t => {});`,
				errors: [
					{...ruleError, message: 'Unknown modifier `onlu`'}
				]
			},
			{
				code: `${header} test.beforeeach(t => {});`,
				errors: [
					{...ruleError, message: 'Unknown modifier `beforeeach`'}
				]
			},
			{
				code: `${header} test.c.only(t => {});`,
				errors: [
					{...ruleError, message: 'Unknown modifier `c`'}
				]
			},
			{
				code: `${header} test.cb.onlu(t => {});`,
				errors: [
					{...ruleError, message: 'Unknown modifier `onlu`'}
				]
			},
			{
				code: `${header} test.foo.bar.baz(t => {});`,
				errors: [
					{...ruleError, message: 'Unknown modifier `foo`'}
				]
			},
			{
				code: `${header} test.default(t => {});`,
				errors: [
					{...ruleError, message: 'Unknown modifier `default`'}
				]
			},
			{
				code: `${header} test.test(t => {});`,
				errors: [
					{...ruleError, message: 'Unknown modifier `test`'}
				]
			}
		]
	});
});

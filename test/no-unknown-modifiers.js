import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-unknown-modifiers';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const ruleId = 'no-unknown-modifiers';
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-unknown-modifiers', rule, {
	valid: [
		`${header}test(t => {});`,
		`${header}test.after(t => {});`,
		`${header}test.afterEach(t => {});`,
		`${header}test.before(t => {});`,
		`${header}test.beforeEach(t => {});`,
		`${header}test.cb(t => {});`,
		`${header}test.cb.only(t => {});`,
		`${header}test.only(t => {});`,
		`${header}test.serial(t => {});`,
		`${header}test.skip(t => {});`,
		`${header}test.todo(t => {});`,
		`${header}test.after.always(t => {});`,
		`${header}test.afterEach.always(t => {});`,
		`${header}test.failing(t => {});`,
		// Shouldn't be triggered since it's not a test file
		'test.foo(t => {});'
	],
	invalid: [
		{
			code: `${header}test.foo(t => {});`,
			errors: [{
				ruleId,
				message: 'Unknown test modifier `.foo`.',
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		},
		{
			code: `${header}test.onlu(t => {});`,
			errors: [{
				ruleId,
				message: 'Unknown test modifier `.onlu`.',
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		},
		{
			code: `${header}test.beforeeach(t => {});`,
			errors: [{
				ruleId,
				message: 'Unknown test modifier `.beforeeach`.',
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		},
		{
			code: `${header}test.c.only(t => {});`,
			errors: [{
				ruleId,
				message: 'Unknown test modifier `.c`.',
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		},
		{
			code: `${header}test.cb.onlu(t => {});`,
			errors: [{
				ruleId,
				message: 'Unknown test modifier `.onlu`.',
				type: 'Identifier',
				line: 2,
				column: 9
			}]
		},
		{
			code: `${header}test.foo.bar.baz(t => {});`,
			errors: [{
				ruleId,
				message: 'Unknown test modifier `.foo`.',
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		},
		{
			code: `${header}test.default(t => {});`,
			errors: [{
				ruleId,
				message: 'Unknown test modifier `.default`.',
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		},
		{
			code: `${header}test.test(t => {});`,
			errors: [{
				ruleId,
				message: 'Unknown test modifier `.test`.',
				type: 'Identifier',
				line: 2,
				column: 6
			}]
		}
	]
});

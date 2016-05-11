import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/use-test';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	},
	parserOptions: {
		sourceType: 'module'
	}
});

const errors = [{ruleId: 'use-test'}];

ruleTester.run('use-test', rule, {
	valid: [
		`var test = require('ava');`,
		`let test = require('ava');`,
		`const test = require('ava');`,
		`const a = 1, test = require('ava'), b = 2;`,
		`const test = require('foo');`,
		`import test from 'ava';`,
		`import test, {} from 'ava';`,
		`import test from 'foo';`
	],
	invalid: [
		{
			code: `var ava = require('ava');`,
			errors
		},
		{
			code: `let ava = require('ava');`,
			errors
		},
		{
			code: `const ava = require('ava');`,
			errors
		},
		{
			code: `const a = 1, ava = require('ava'), b = 2;`,
			errors
		},
		{
			code: `import ava from 'ava';`,
			errors
		}
	]
});

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
		`import test from 'foo';`,
		`import {serial as test} from 'ava';`
	],
	invalid: [
		{
			code: `var ava = require('ava');`,
			output: `var ava = require('ava');`, // not fixeable
			errors
		},
		{
			code: `let ava = require('ava');`,
			output: `let ava = require('ava');`, // not fixeable
			errors
		},
		{
			code: `const ava = require('ava');`,
			output: `const ava = require('ava');`, // not fixeable
			errors
		},
		{
			code: `const a = 1, ava = require('ava'), b = 2;`,
			output: `const a = 1, ava = require('ava'), b = 2;`, // not fixeable
			errors
		},
		{
			code: `import ava from 'ava';`,
			output: `import ava from 'ava';`, // not fixeable
			errors
		},
		{
			code: `import {test} from 'ava';`,
			output: `import test from 'ava';`,
			errors
		},
		{
			code: `import {test, serial} from 'ava';`,
			output: `import test, {serial} from 'ava';`,
			errors
		},
		{
			code: `import {test, serial as s} from 'ava';`,
			output: `import test, {serial as s} from 'ava';`,
			errors
		},
		{
			code: `import {test, serial as s, skip} from 'ava';`,
			output: `import test, {serial as s, skip} from 'ava';`,
			errors
		},
	]
});

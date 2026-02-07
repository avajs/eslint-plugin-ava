import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/use-test.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
});

const typescriptRuleTester = new AvaRuleTester(test, {
	languageOptions: {
		parser: tsParser,
	},
});

const errors = [{messageId: 'use-test'}];

const prefixTestCases = (testCases, prefix) => ({
	assertionOptions: {
		requireMessage: true,
	},
	valid: testCases.valid.map(testCase => ({
		...typeof testCase === 'string' ? {code: testCase} : testCase,
		name: `[${prefix}] ${typeof testCase === 'string' ? testCase : testCase.code}`,
	})),
	invalid: testCases.invalid.map(testCase => ({
		...testCase,
		name: `[${prefix}] ${testCase.code}`,
	})),
});

const commonTestCases = {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		{code: 'var test = require(\'ava\');', filename: 'file.js'},
		{code: 'let test = require(\'ava\');', filename: 'file.js'},
		{code: 'const test = require(\'ava\');', filename: 'file.js'},
		{code: 'const a = 1, test = require(\'ava\'), b = 2;', filename: 'file.js'},
		{code: 'const test = require(\'foo\');', filename: 'file.js'},
		{code: 'import test from \'ava\';', filename: 'file.js'},
		{code: 'import test, {} from \'ava\';', filename: 'file.js'},
		{code: 'import test from \'foo\';', filename: 'file.js'},
		{code: 'var anyTest = require(\'ava\');', filename: 'file.ts'},
		{code: 'let anyTest = require(\'ava\');', filename: 'file.ts'},
		{code: 'const anyTest = require(\'ava\');', filename: 'file.ts'},
		{code: 'const a = 1, anyTest = require(\'ava\'), b = 2;', filename: 'file.ts'},
		{code: 'const anyTest = require(\'foo\');', filename: 'file.ts'},
		{code: 'import anyTest from \'ava\';', filename: 'file.ts'},
		{code: 'import anyTest, {} from \'ava\';', filename: 'file.ts'},
		{code: 'import anyTest from \'foo\';', filename: 'file.ts'},
		{code: 'var anyTest = require(\'ava\');', filename: 'file.tsx'},
		{code: 'let anyTest = require(\'ava\');', filename: 'file.tsx'},
		{code: 'const anyTest = require(\'ava\');', filename: 'file.tsx'},
		{code: 'const a = 1, anyTest = require(\'ava\'), b = 2;', filename: 'file.tsx'},
		{code: 'const anyTest = require(\'foo\');', filename: 'file.tsx'},
		{code: 'import anyTest from \'ava\';', filename: 'file.tsx'},
		{code: 'import anyTest, {} from \'ava\';', filename: 'file.tsx'},
		{code: 'import anyTest from \'foo\';', filename: 'file.tsx'},
	],
	invalid: [
		{
			code: 'var ava = require(\'ava\');',
			errors,
			filename: 'file.ts',
		},
		{
			code: 'let ava = require(\'ava\');',
			errors,
			filename: 'file.ts',
		},
		{
			code: 'const ava = require(\'ava\');',
			errors,
			filename: 'file.ts',
		},
		{
			code: 'const a = 1, ava = require(\'ava\'), b = 2;',
			errors,
			filename: 'file.ts',
		},
		{
			code: 'import ava from \'ava\';',
			errors,
			filename: 'file.ts',
		},
		{
			code: 'var anyTest = require(\'ava\');',
			errors,
			filename: 'file.js',
		},
		{
			code: 'var ava = require(\'ava\');',
			errors,
			filename: 'file.tsx',
		},
		{
			code: 'let ava = require(\'ava\');',
			errors,
			filename: 'file.tsx',
		},
		{
			code: 'const ava = require(\'ava\');',
			errors,
			filename: 'file.tsx',
		},
		{
			code: 'const a = 1, ava = require(\'ava\'), b = 2;',
			errors,
			filename: 'file.tsx',
		},
		{
			code: 'import ava from \'ava\';',
			errors,
			filename: 'file.tsx',
		},
	],
};

const typescriptTestCases = {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		{code: 'import type {Macro} from \'ava\';', filename: 'file.ts'},
		{code: 'import type {Macro} from \'ava\';', filename: 'file.tsx'},
	],
	invalid: [],
};

ruleTester.run('use-test', rule, commonTestCases);
typescriptRuleTester.run('use-test', rule, prefixTestCases(commonTestCases, 'ts'));
typescriptRuleTester.run('use-test', rule, prefixTestCases(typescriptTestCases, 'ts-type'));

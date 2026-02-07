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

const typescriptExtensions = ['.ts', '.tsx', '.mts', '.cts'];

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
		...typescriptExtensions.flatMap(extension => [
			{code: 'var anyTest = require(\'ava\');', filename: `file${extension}`},
			{code: 'let anyTest = require(\'ava\');', filename: `file${extension}`},
			{code: 'const anyTest = require(\'ava\');', filename: `file${extension}`},
			{code: 'const a = 1, anyTest = require(\'ava\'), b = 2;', filename: `file${extension}`},
			{code: 'const anyTest = require(\'foo\');', filename: `file${extension}`},
			{code: 'import anyTest from \'ava\';', filename: `file${extension}`},
			{code: 'import anyTest, {} from \'ava\';', filename: `file${extension}`},
			{code: 'import anyTest from \'foo\';', filename: `file${extension}`},
		]),
	],
	invalid: [
		...typescriptExtensions.flatMap(extension => [
			{code: 'var ava = require(\'ava\');', errors, filename: `file${extension}`},
			{code: 'let ava = require(\'ava\');', errors, filename: `file${extension}`},
			{code: 'const ava = require(\'ava\');', errors, filename: `file${extension}`},
			{code: 'const a = 1, ava = require(\'ava\'), b = 2;', errors, filename: `file${extension}`},
			{code: 'import ava from \'ava\';', errors, filename: `file${extension}`},
		]),
		{
			code: 'var anyTest = require(\'ava\');',
			errors,
			filename: 'file.js',
		},
	],
};

const typescriptTestCases = {
	assertionOptions: {
		requireMessage: true,
	},
	valid: typescriptExtensions.map(extension => (
		{code: 'import type {Macro} from \'ava\';', filename: `file${extension}`}
	)),
	invalid: [],
};

ruleTester.run('use-test', rule, commonTestCases);
typescriptRuleTester.run('use-test', rule, prefixTestCases(commonTestCases, 'ts'));
typescriptRuleTester.run('use-test', rule, prefixTestCases(typescriptTestCases, 'ts-type'));

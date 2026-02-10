import RuleTester from './helpers/rule-tester.js';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/use-test.js';

const ruleTester = new RuleTester({autoHeader: false});

const typescriptRuleTester = new RuleTester({
	autoHeader: false,
	languageOptions: {
		parser: tsParser,
	},
});

const errors = [{messageId: 'use-test'}];

const typescriptExtensions = ['.ts', '.tsx', '.mts', '.cts'];

const prefixTestCases = (testCases, prefix) => ({
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
	valid: [
		{code: 'import test from \'ava\';', filename: 'file.js'},
		{code: 'import test, {} from \'ava\';', filename: 'file.js'},
		{code: 'import test from \'foo\';', filename: 'file.js'},
		...typescriptExtensions.flatMap(extension => [
			{code: 'import anyTest from \'ava\';', filename: `file${extension}`},
			{code: 'import anyTest, {} from \'ava\';', filename: `file${extension}`},
			{code: 'import anyTest from \'foo\';', filename: `file${extension}`},
		]),
	],
	invalid: [
		...typescriptExtensions.flatMap(extension => [
			{code: 'import ava from \'ava\';', errors, filename: `file${extension}`},
		]),
		{code: 'import anyTest from \'ava\';', errors, filename: 'file.js'},
	],
};

const typescriptTestCases = {
	valid: typescriptExtensions.flatMap(extension => [
		// Statement-level type import
		{code: 'import type {Macro} from \'ava\';', filename: `file${extension}`},
		// Inline type imports
		{code: 'import {type Macro} from \'ava\';', filename: `file${extension}`},
		{code: 'import {type Macro, type TestFn} from \'ava\';', filename: `file${extension}`},
		// Default + inline type imports
		{code: 'import test, {type Macro} from \'ava\';', filename: `file${extension}`},
		{code: 'import anyTest, {type Macro} from \'ava\';', filename: `file${extension}`},
	]),
	invalid: typescriptExtensions.map(extension => (
		// Default with wrong name + inline type import should still report
		{code: 'import ava, {type Macro} from \'ava\';', errors, filename: `file${extension}`}
	)),
};

ruleTester.run('use-test', rule, commonTestCases);
typescriptRuleTester.run('use-test', rule, prefixTestCases(commonTestCases, 'ts'));
typescriptRuleTester.run('use-test', rule, prefixTestCases(typescriptTestCases, 'ts-type'));

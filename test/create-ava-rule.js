import RuleTester from './helpers/rule-tester.js';
import tsParser from '@typescript-eslint/parser';
import createAvaRule from '../create-ava-rule.js';

const rule = {
	create(context) {
		const ava = createAvaRule();

		return ava.merge({
			'Program:exit'(node) {
				if (!ava.isInTestFile()) {
					context.report({node, message: 'not a test file'});
				}
			},
		});
	},
};

const ruleTester = new RuleTester({autoHeader: false});

const typescriptRuleTester = new RuleTester({
	autoHeader: false,
	languageOptions: {
		parser: tsParser,
	},
});

const errors = [
	{
		message: 'not a test file',
	},
];

ruleTester.run('rule-fixture', rule, {
	valid: [
		// `import` patterns
		'import test from \'ava\';',
		'import {serial} from \'ava\';',
		'import {serial as test} from \'ava\';',
		{name: 'import anyTest default', code: 'import anyTest from \'ava\';'},
		// Additional import specifiers should not break detection
		{name: 'import test with named imports', code: 'import test, { TestFn } from \'ava\';'},
		{name: 'import anyTest with named imports', code: 'import anyTest, { TestFn } from \'ava\';'},
		{name: 'import serial with named imports', code: 'import { serial, TestFn } from \'ava\';'},
	],

	invalid: [
		// Non-ava source
		{name: 'import non-ava', code: 'import test from \'not-ava\';', errors},
		// No AVA import at all
		{name: 'no ava import', code: 'test(t => {});', errors},
		// Unknown named exports
		{code: 'import {serial2} from \'ava\';', errors},
		{code: 'import {serial2 as test} from \'ava\';', errors},
	],
});

typescriptRuleTester.run('rule-fixture-ts', rule, {
	valid: [
		// TypeScript re-assignment patterns
		{name: 'as assertion', code: 'import anyTest from \'ava\';\nconst test = anyTest as any;'},
		{name: 'angle bracket assertion', code: 'import anyTest from \'ava\';\nconst test = <any>anyTest;'},
		{name: 'satisfies', code: 'import anyTest from \'ava\';\nconst test = anyTest satisfies any;'},
		{name: 'non-null assertion', code: 'import anyTest from \'ava\';\nconst test = anyTest!;'},
		{name: 'with named type imports', code: 'import anyTest, { type TestFn } from \'ava\';\nconst test = anyTest as any;'},
		// Default + inline type-only specifiers
		{name: 'default with type specifiers only', code: 'import test, { type Macro } from \'ava\';'},
	],
	invalid: [
		// Type-only imports should NOT make it a test file
		{name: 'type-only import', code: 'import type { TestFn } from \'ava\';', errors},
		{name: 'inline type-only imports', code: 'import { type TestFn, type Macro } from \'ava\';', errors},
	],
});

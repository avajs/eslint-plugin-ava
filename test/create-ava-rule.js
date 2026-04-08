import RuleTester from './helpers/rule-tester.js';
import tsParser from '@typescript-eslint/parser';
import createAvaRule from '../create-ava-rule.js';

const rule = {
	create(context) {
		const ava = createAvaRule(context.sourceCode);

		return ava.merge({
			'Program:exit'(node) {
				if (!ava.isInTestFile()) {
					context.report({node, message: 'not a test file'});
				}
			},
		});
	},
};

const modifierRule = {
	create(context) {
		const ava = createAvaRule(context.sourceCode);

		return ava.merge({
			CallExpression(node) {
				if (!ava.isTestNode(node)) {
					return;
				}

				if (node.callee.type === 'Identifier' && node.callee.name === 'before' && !ava.hasTestModifier('before')) {
					context.report({node, message: 'before alias lost modifiers'});
				}

				if (node.callee.type === 'Identifier' && node.callee.name === 'todo' && !ava.hasTestModifier('todo')) {
					context.report({node, message: 'todo alias lost modifiers'});
				}
			},
		});
	},
};

const testNodeRule = {
	create(context) {
		const ava = createAvaRule(context.sourceCode);

		return ava.merge({
			CallExpression(node) {
				if (
					node.callee.type === 'Identifier'
					&& node.callee.name === 'test'
					&& !ava.isTestNode(node)
				) {
					context.report({node, message: 'default test binding not recognized'});
				}
			},
		});
	},
};

const aliasedModifierTestNodeRule = {
	create(context) {
		const ava = createAvaRule(context.sourceCode);

		return ava.merge({
			CallExpression(node) {
				if (
					node.callee.type === 'Identifier'
					&& node.callee.name === 'before'
					&& !ava.isTestNode(node)
				) {
					context.report({node, message: 'modifier alias not recognized'});
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
		// Member-derived test function aliases
		{name: 'member alias: const serial = test.serial', code: 'import test from \'ava\';\nconst serial = test.serial;'},
		{name: 'member alias: const hook = test.before', code: 'import test from \'ava\';\nconst hook = test.before;'},
		{name: 'member alias: chained member access', code: 'import test from \'ava\';\nconst fn = test.serial.before;'},
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
		{name: 'let as assertion', code: 'import anyTest from \'ava\';\nlet test = anyTest as any;'},
		{name: 'var as assertion', code: 'import anyTest from \'ava\';\nvar test = anyTest as any;'},
		{name: 'angle bracket assertion', code: 'import anyTest from \'ava\';\nconst test = <any>anyTest;'},
		{name: 'satisfies', code: 'import anyTest from \'ava\';\nconst test = anyTest satisfies any;'},
		{name: 'non-null assertion', code: 'import anyTest from \'ava\';\nconst test = anyTest!;'},
		{name: 'with named type imports', code: 'import anyTest, { type TestFn } from \'ava\';\nconst test = anyTest as any;'},
		// Default + inline type-only specifiers
		{name: 'default with type specifiers only', code: 'import test, { type Macro } from \'ava\';'},
		// Member alias with TypeScript cast
		{name: 'member alias with TS cast', code: 'import test from \'ava\';\nconst serial = test.serial as any;'},
	],
	invalid: [
		// Type-only imports should NOT make it a test file
		{name: 'type-only import', code: 'import type { TestFn } from \'ava\';', errors},
		{name: 'inline type-only imports', code: 'import { type TestFn, type Macro } from \'ava\';', errors},
	],
});

typescriptRuleTester.run('aliased-modifier-test-node-rule-fixture-ts', aliasedModifierTestNodeRule, {
	valid: [
		'import anyTest, {type TestFn} from \'ava\';\nconst before = (anyTest as TestFn).before;\nbefore(t => {});',
		'import test from \'ava\';\nconst before = (test as any).before;\nbefore(t => {});',
	],
	invalid: [],
});

ruleTester.run('modifier-rule-fixture', modifierRule, {
	valid: [
		'import test from \'ava\';\nconst before = test.before;\nbefore(t => {});',
		'import test from \'ava\';\nconst todo = test.todo;\ntodo(\'name\');',
		'import test from \'ava\';\nlet before = test.before;\nbefore(t => {});\nbefore = helper;',
		'import test from \'ava\';\nlet before = test.before;\nfunction mutate() {\n\tbefore = helper;\n}\nbefore(t => {});',
	],
	invalid: [],
});

ruleTester.run('test-node-rule-fixture', testNodeRule, {
	valid: [
		'import test from \'ava\';\ntest(\'name\', t => {});',
		'import anyTest from \'ava\';\nlet test = anyTest;\ntest(\'name\', t => {});',
	],
	invalid: [],
});

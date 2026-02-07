import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
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

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
});

const errors = [
	{
		message: 'not a test file',
	},
];

ruleTester.run('rule-fixture', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		'const test = require(\'ava\');',
		'const {serial} = require(\'ava\');',
		'const {serial: test} = require(\'ava\');',
		'import test from \'ava\';',
		'import {serial} from \'ava\';',
		'import {serial as test} from \'ava\';',
	],

	invalid: [
		{
			code: 'const test2 = require(\'ava\');',
			errors,
		},
		{
			code: 'const {serial2} = require(\'ava\');',
			errors,
		},
		{
			code: 'const {serial2: test} = require(\'ava\');',
			errors,
		},
		{
			code: 'import test2 from \'ava\';',
			errors,
		},
		{
			code: 'import {serial2} from \'ava\';',
			errors,
		},
		{
			code: 'import {serial2 as test} from \'ava\';',
			errors,
		},
	],
});

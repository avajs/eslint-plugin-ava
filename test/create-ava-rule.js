import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import {visitIf} from 'enhance-visitors';
import createAvaRule from '../create-ava-rule';

const rule = {
	create: context => {
		const ava = createAvaRule();

		return ava.merge({
			'Program:exit': node => {
				if (!ava.isInTestFile()) {
					context.report({node, message: 'not a test file'});
				}
			}
		});
	}
};

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true,
	},
	parserOptions: {
		sourceType: 'module'
	}
});

ruleTester.run('rule-fixture', rule, {
	valid: [
		'const test = require(\'ava\');',
		'const {serial} = require(\'ava\');',
		'const {serial: test} = require(\'ava\');',
		'import test from \'ava\';',
		'import {serial} from \'ava\';',
		'import {serial as test} from \'ava\';'
	],

	invalid: [
		{
			code: 'const test2 = require(\'ava\');',
			errors: [{message: 'not a test file'}]
		},
		{
			code: 'const {serial2} = require(\'ava\');',
			errors: [{message: 'not a test file'}]
		},
		{
			code: 'const {serial2: test} = require(\'ava\');',
			errors: [{message: 'not a test file'}]
		},
		{
			code: 'import test2 from \'ava\';',
			errors: [{message: 'not a test file'}]
		},
		{
			code: 'import {serial2} from \'ava\';',
			errors: [{message: 'not a test file'}]
		},
		{
			code: 'import {serial2 as test} from \'ava\';',
			errors: [{message: 'not a test file'}]
		}
	]
});

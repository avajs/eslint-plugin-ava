'use strict';

const path = require('path');
const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const util = require('../util');
const rule = require('../rules/no-import-test-files');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true,
	},
	parserOptions: {
		sourceType: 'module',
	},
});

const rootDir = path.dirname(__dirname);
const toPath = subPath => path.join(rootDir, subPath);

util.loadAvaHelper = () => ({
	classifyImport: importPath => {
		switch (importPath) {
			case toPath('lib/foo.test.js'):
				return {isHelper: false, isTest: true};
			case toPath('../foo.test.js'):
				return {isHelper: false, isTest: true};
			case toPath('@foo/bar'): // Regression test for https://github.com/avajs/eslint-plugin-ava/issues/253
				return {isHelper: false, isTest: true};
			default:
				return {isHelper: false, isTest: false};
		}
	},
});

const errors = [
	{
		message: 'Test files should not be imported.',
	},
];

ruleTester.run('no-import-test-files', rule, {
	valid: [
		'import test from \'ava\';',
		'import foo from \'@foo/bar\';',
		'import foo from \'/foo/bar\';', // Classfied as not a test.
		'const test = require(\'ava\');',
		'console.log()',
		'const value = require(somePath);',
		'const highlight = require(\'highlight.js\')',
		{
			code: 'const highlight = require(\'highlight.js\')',
			filename: toPath('test/index.js'),
		},
		'const value = require(true);',
		'const value = require();',
	],
	invalid: [
		{
			code: 'const test = require(\'./foo.test.js\');',
			filename: toPath('lib/foo.js'),
			errors,
		},
		{
			code: 'const test = require(\'../foo.test.js\');',
			filename: toPath('foo.js'),
			errors,
		},
	],
});

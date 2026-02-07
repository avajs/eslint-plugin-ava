import path from 'node:path';
import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import util from '../util.js';
import rule from '../rules/no-import-test-files.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
});

const rootDirectory = path.dirname(import.meta.dirname);
const toPath = subPath => path.join(rootDirectory, subPath);

util.loadAvaHelper = () => ({
	classifyImport(importPath) {
		switch (importPath) {
			case toPath('lib/foo.test.js'): {
				return {isHelper: false, isTest: true};
			}

			case toPath('../foo.test.js'): {
				return {isHelper: false, isTest: true};
			}

			case toPath('@foo/bar'): { // Regression test for https://github.com/avajs/eslint-plugin-ava/issues/253
				return {isHelper: false, isTest: true};
			}

			case toPath('test'): { // Regression test for https://github.com/avajs/eslint-plugin-ava/issues/311
				return {isHelper: false, isTest: true};
			}

			case toPath('test/index'): { // After resolving directory to index file
				return {isHelper: false, isTest: false};
			}

			default: {
				return {isHelper: false, isTest: false};
			}
		}
	},
});

const errors = [
	{
		messageId: 'no-import-test-files',
	},
];

ruleTester.run('no-import-test-files', rule, {
	assertionOptions: {
		requireMessage: true,
	},
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
		{ // Regression test for https://github.com/avajs/eslint-plugin-ava/issues/311
			code: 'const helpers = require(\'./test\');',
			filename: toPath('foo.js'),
			name: 'directory-import-require',
		},
		{ // Regression test for https://github.com/avajs/eslint-plugin-ava/issues/311
			code: 'import helpers from \'./test\';',
			filename: toPath('foo.js'),
			name: 'directory-import-esm',
		},
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

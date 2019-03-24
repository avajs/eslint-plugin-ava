import path from 'path';
import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import util from '../util';
import rule from '../rules/no-import-test-files';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	},
	parserOptions: {
		sourceType: 'module'
	}
});

const rootDir = path.dirname(__dirname);
const toPath = subPath => path.join(rootDir, subPath);

util.getAvaConfig = () => ({
	files: ['lib/*.test.js']
});

ruleTester.run('no-import-test-files', rule, {
	valid: [
		{
			code: 'import test from \'ava\';'
		},
		{
			code: 'const test = require(\'ava\');'
		},
		{
			code: 'console.log()'
		},
		{
			code: 'const value = require(somePath);'
		},
		{
			code: 'const highlight = require("highlight.js");',
			filename: toPath('lib/foo.js')
		},
		{
			code: 'const highlight = require("highlight.js");',
			filename: toPath('test/foo.test.js')
		},
		{
			code: 'const noninstalled = require("noninstalled.js");',
			filename: toPath('lib/foo.js')
		},
		{
			code: 'const noninstalled = require("noninstalled.js");',
			filename: toPath('lib/foo.test.js')
		},
		{
			code: 'import h from \'highlight.js\'',
			filename: toPath('lib/foo.test.js')
		},
		{
			code: 'import * as highlight from \'highlight.js\'',
			filename: toPath('lib/foo.test.js')
		},
		{
			code: 'const foo = require(\'\')'
		},
		{
			code: 'const foo = require(false)'
		}
	],
	invalid: [
		{
			code: 'const test = require(\'./foo.test.js\');',
			filename: toPath('lib/foo.js'),
			errors: [{message: 'Test files should not be imported'}]
		},
		{
			code: 'import test from \'./foo.test.js\';',
			filename: toPath('lib/foo.js'),
			errors: [{message: 'Test files should not be imported'}]
		}
	]
});

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
	files: [
		'lib/*.test.js',
		'lib/*.test.jsx',
		'lib/*.test.mjs',
	],
	babel: {
		extensions: ['js', 'jsx']
	}
});

ruleTester.run('no-import-test-files', rule, {
	valid: [
		'import test from \'ava\';',
		'const test = require(\'ava\');',
		'console.log()',
		'const value = require(somePath);',
		'import test from \'./foo.test.mjs\';'
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
		},
		{
			code: 'import test from \'./foo.test.jsx\';',
			filename: toPath('lib/foo.js'),
			errors: [{message: 'Test files should not be imported'}]
		}
	]
});

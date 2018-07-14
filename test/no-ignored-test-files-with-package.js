import path from 'path';
import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import util from '../util';
import rule from '../rules/no-ignored-test-files';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const header = `const test = require('ava');\n`;
const rootDir = path.dirname(__dirname);

const toPath = subPath => path.join(rootDir, subPath);
const code = hasHeader => (hasHeader ? header : '') + 'test(t => { t.pass(); });';

util.getAvaConfig = () => ({
	files: ['lib/**/*.test.js']
});

ruleTester.run('no-ignored-test-files', rule, {
	valid: [
		{
			code: code(true),
			filename: toPath('lib/foo.test.js')
		},
		{
			code: code(true),
			filename: toPath('bar/foo.test.js'),
			options: [{files: ['bar/**/*.test.js']}]
		},
		{
			code: code(true),
			filename: toPath('bar/foo.test.js'),
			options: [{files: ['bar/**/*.test.js']}]
		},
		{
			code: code(true),
			filename: '<text>',
			options: [{files: ['lib/**/*.spec.js']}]
		}
	],
	invalid: [
		{
			code: code(true),
			filename: toPath('lib/foo/fixtures/bar.test.js'),
			errors: [{message: 'Test file is ignored because it is in `**/fixtures/** **/helpers/**`.'}]
		},
		{
			code: code(true),
			filename: toPath('lib/foo/helpers/bar.test.js'),
			errors: [{message: 'Test file is ignored because it is in `**/fixtures/** **/helpers/**`.'}]
		},
		{
			code: code(true),
			filename: toPath('test.js'),
			errors: [{message: 'Test file is ignored because it is not in `lib/**/*.test.js`.'}]
		},
		{
			code: code(true),
			filename: toPath('bar/foo.test.js'),
			errors: [{message: 'Test file is ignored because it is not in `lib/**/*.test.js`.'}]
		},
		{
			code: code(true),
			filename: toPath('lib/foo.test.js'),
			options: [{files: ['bar/**/*.test.js']}],
			errors: [{message: 'Test file is ignored because it is not in `bar/**/*.test.js`.'}]
		},
		{
			code: code(true),
			filename: toPath('lib/foo.test.js'),
			options: [{files: ['bar/**/*.test.js']}],
			errors: [{message: 'Test file is ignored because it is not in `bar/**/*.test.js`.'}]
		}
	]
});

import path from 'path';
import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-ignored-test-files';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const header = 'const test = require(\'ava\');\n';
const rootDir = path.dirname(__dirname);
const toPath = subPath => path.join(rootDir, subPath);
const code = hasHeader => (hasHeader ? header : '') + 'test(t => { t.pass(); });';

ruleTester.run('no-ignored-test-files', rule, {
	valid: [
		{
			code: code(true),
			filename: toPath('test/foo/bar.js')
		},
		{
			code: code(true),
			filename: toPath('test/foo/not-fixtures/bar.js')
		},
		{
			code: code(true),
			filename: toPath('test/foo/not-helpers/bar.js')
		},
		{
			code: header + 'foo(t => {});',
			filename: toPath('test/foo/fixtures/bar.js')
		},
		{
			code: header + 'foo(t => {});',
			filename: toPath('test/foo/helpers/bar.js')
		},
		{
			code: code(false),
			filename: toPath('test/foo/fixtures/bar.js')
		},
		{
			code: code(false),
			filename: toPath('test/foo/helpers/bar.js')
		},
		{
			code: code(true),
			filename: toPath('test.js')
		},
		{
			code: code(true),
			filename: toPath('test-foo.js')
		},
		{
			code: code(true),
			filename: toPath('lib/foo.test.js')
		},
		{
			code: code(true),
			filename: toPath('lib/foo.spec.js'),
			options: [{files: ['lib/**/*.spec.js']}]
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
			filename: toPath('test/foo/fixtures/bar.js'),
			errors: [{message: 'Test file is ignored because it is in `**/fixtures/** **/helpers/**`.'}]
		},
		{
			code: code(true),
			filename: toPath('test/foo/helpers/bar.js'),
			errors: [{message: 'Test file is ignored because it is in `**/fixtures/** **/helpers/**`.'}]
		},
		{
			code: code(true),
			filename: toPath('lib/foo.spec.js'),
			errors: [{message: 'Test file is ignored because it is not in `test.js test-*.js test/**/*.js **/__tests__/**/*.js **/*.test.js`.'}]
		},
		{
			code: code(true),
			filename: toPath('test/foo/bar.js'),
			options: [{files: ['lib/**/*.spec.js']}],
			errors: [{message: 'Test file is ignored because it is not in `lib/**/*.spec.js`.'}]
		},
		{
			code: code(true),
			filename: toPath('lib/foo.not-test.js'),
			options: [{files: ['lib/**/*.spec.js']}],
			errors: [{message: 'Test file is ignored because it is not in `lib/**/*.spec.js`.'}]
		}
	]
});

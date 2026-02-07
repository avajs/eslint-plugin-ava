import path from 'node:path';
import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import util from '../util.js';
import rule from '../rules/no-ignored-test-files.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';
const rootDirectory = path.dirname(import.meta.dirname);

const toPath = subPath => path.join(rootDirectory, subPath);
const code = hasHeader => (hasHeader ? header : '') + 'test(t => { t.pass(); });';

util.loadAvaHelper = () => ({
	classifyFile(file) {
		switch (file) {
			case toPath('lib/foo.test.js'): {
				return {isHelper: false, isTest: true};
			}

			case toPath('lib/foo/fixtures/bar.test.js'): {
				return {isHelper: false, isTest: false};
			}

			case toPath('lib/foo/helpers/bar.test.js'): {
				return {isHelper: true, isTest: false};
			}

			default: {
				return {isHelper: false, isTest: false};
			}
		}
	},
});

ruleTester.run('no-ignored-test-files', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		{
			code: code(true),
			filename: toPath('lib/foo.test.js'),
		},
	],
	invalid: [
		{
			code: code(true),
			filename: toPath('lib/foo/fixtures/bar.test.js'),
			errors: [{messageId: 'ignored-file'}],
		},
		{
			code: code(true),
			filename: toPath('lib/foo/helpers/bar.test.js'),
			errors: [{messageId: 'helper-file'}],
		},
		{
			code: code(true),
			filename: toPath('test.js'),
			errors: [{messageId: 'ignored-file'}],
		},
		{
			code: code(true),
			filename: toPath('bar/foo.test.js'),
			errors: [{messageId: 'ignored-file'}],
		},
	],
});

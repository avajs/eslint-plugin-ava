'use strict';

const path = require('path');
const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const util = require('../util');
const rule = require('../rules/no-ignored-test-files');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true,
	},
});

const header = 'const test = require(\'ava\');\n';
const rootDir = path.dirname(__dirname);

const toPath = subPath => path.join(rootDir, subPath);
const code = hasHeader => (hasHeader ? header : '') + 'test(t => { t.pass(); });';

util.loadAvaHelper = () => ({
	classifyFile(file) {
		switch (file) {
			case toPath('lib/foo.test.js'):
				return {isHelper: false, isTest: true};
			case toPath('lib/foo/fixtures/bar.test.js'):
				return {isHelper: false, isTest: false};
			case toPath('lib/foo/helpers/bar.test.js'):
				return {isHelper: true, isTest: false};
			default:
				return {isHelper: false, isTest: false};
		}
	},
});

ruleTester.run('no-ignored-test-files', rule, {
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
			errors: [{message: 'AVA ignores this file.'}],
		},
		{
			code: code(true),
			filename: toPath('lib/foo/helpers/bar.test.js'),
			errors: [{message: 'AVA treats this as a helper file.'}],
		},
		{
			code: code(true),
			filename: toPath('test.js'),
			errors: [{message: 'AVA ignores this file.'}],
		},
		{
			code: code(true),
			filename: toPath('bar/foo.test.js'),
			errors: [{message: 'AVA ignores this file.'}],
		},
	],
});

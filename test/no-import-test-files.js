import path from 'path';
import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import util from '../util';
import rule from '../rules/no-import-test-files';

const ruleTester = avaRuleTester(test, {
	parserOptions: {
		sourceType: 'module'
	},
	env: {
		es6: true
	}
});

const rootDir = path.dirname(__dirname);

function toPath(subPath) {
	return path.join(rootDir, subPath);
}

util.getAvaConfig = function () {
	return {
		files: ['lib/*.test.js']
	};
};

ruleTester.run('no-import-test-files', rule, {
	valid: [{
		code: 'import test from \'ava\';',
	}, {
		code: 'const test = require(\'ava\');',
	}, {
		code: 'console.log()',
	}, {
		code: 'const value = require(somePath);',
	}],

	invalid: [
		{
			code: 'const test = require(\'./foo.test.js\');',
			filename: toPath('lib/foo.js'),
			errors: [{message: 'You are importing a test file'}]
		},
		{
			code: 'import test from \'./foo.test.js\';',
			filename: toPath('lib/foo.js'),
			errors: [{message: 'You are importing a test file'}]
		},
	]
});

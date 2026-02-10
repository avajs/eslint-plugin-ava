import RuleTester, {toPath} from './helpers/rule-tester.js';
import util from '../util.js';
import rule from '../rules/no-import-test-files.js';

const ruleTester = new RuleTester({autoHeader: false});

util.loadAvaHelper = filename => {
	if (filename === toPath('no-helper.js')) {
		return undefined;
	}

	return {
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
	};
};

const errors = [
	{
		messageId: 'no-import-test-files',
	},
];

ruleTester.run('no-import-test-files', rule, {
	valid: [
		'import test from \'ava\';',
		'import foo from \'@foo/bar\';',
		'import foo from \'/foo/bar\';', // Classfied as not a test.
		'console.log()',
		{ // Regression test for https://github.com/avajs/eslint-plugin-ava/issues/311
			code: 'import helpers from \'./test\';',
			filename: toPath('foo.js'),
			name: 'directory-import-esm',
		},
		{
			code: 'import foo from \'./bar.js\';',
			filename: toPath('no-helper.js'),
			name: 'no-ava-helper',
		},
	],
	invalid: [
		{
			code: 'import test from \'./foo.test.js\';',
			filename: toPath('lib/foo.js'),
			errors,
		},
		{
			code: 'import test from \'../foo.test.js\';',
			filename: toPath('foo.js'),
			errors,
		},
	],
});

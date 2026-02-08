import RuleTester, {toPath} from './helpers/rule-tester.js';
import util from '../util.js';
import rule from '../rules/no-ignored-test-files.js';

const ruleTester = new RuleTester();
const code = 'test(t => { t.pass(); });';

util.loadAvaHelper = filename => {
	if (filename === toPath('no-helper.test.js')) {
		return undefined;
	}

	return {
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
	};
};

ruleTester.run('no-ignored-test-files', rule, {
	valid: [
		{
			code,
			filename: toPath('lib/foo.test.js'),
		},
		{
			code,
			filename: '<input>',
			name: 'synthetic-filename',
		},
		{
			code: 'const x = 1;',
			filename: toPath('lib/foo.test.js'),
			name: 'no-test-call',
		},
		{
			code,
			filename: toPath('no-helper.test.js'),
			name: 'no-ava-helper',
		},
	],
	invalid: [
		{
			code,
			filename: toPath('lib/foo/fixtures/bar.test.js'),
			errors: [{messageId: 'ignored-file'}],
		},
		{
			code,
			filename: toPath('lib/foo/helpers/bar.test.js'),
			errors: [{messageId: 'helper-file'}],
		},
		{
			code,
			filename: toPath('test.js'),
			errors: [{messageId: 'ignored-file'}],
		},
		{
			code,
			filename: toPath('bar/foo.test.js'),
			errors: [{messageId: 'ignored-file'}],
		},
	],
});

import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-skip-test.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const messageId = 'no-skip-test';
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-skip-test', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		header + 'test("my test name", t => { t.pass(); });',
		header + 'test(t => { t.pass(); }); test(t => { t.pass(); });',
		header + 'test(t => { t.skip.is(1, 2); });',
		header + 'notTest.skip();',
		// Shouldn't be triggered since it's not a test file
		'test.skip(t => {});',
	],
	invalid: [
		{
			code: header + 'test.skip(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [{
					messageId: 'no-skip-test-suggestion',
					output: header + 'test(t => { t.pass(); });',
				}],
			}],
		},
	],
});

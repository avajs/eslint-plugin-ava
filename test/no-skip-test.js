import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-skip-test.js';

const ruleTester = new RuleTester();

const messageId = 'no-skip-test';

ruleTester.run('no-skip-test', rule, {
	valid: [
		'test("my test name", t => { t.pass(); });',
		'test(t => { t.pass(); }); test(t => { t.pass(); });',
		'test(t => { t.skip.is(1, 2); });',
		'notTest.skip();',
		// Shouldn't be triggered since it's not a test file
		{code: 'test.skip(t => {});', noHeader: true},
	],
	invalid: [
		{
			code: 'test.skip(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [{
					messageId: 'no-skip-test-suggestion',
					output: 'test(t => { t.pass(); });',
				}],
			}],
		},
	],
});

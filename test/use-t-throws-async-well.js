import RuleTester, {testCase, asyncTestCase} from './helpers/rule-tester.js';
import rule from '../rules/use-t-throws-async-well.js';

const ruleTester = new RuleTester();

ruleTester.run('use-t-throws-async-well', rule, {
	valid: [
		asyncTestCase('await t.throwsAsync(f)'),
		asyncTestCase('await t.notThrowsAsync(f)'),
		asyncTestCase('t.throws(f)'),
		asyncTestCase('t.notThrows(f)'),
		asyncTestCase('f(t.throwsAsync(f))'),
		asyncTestCase('let p = t.throwsAsync(f)'),
		asyncTestCase('p = t.throwsAsync(f)'),
		{code: asyncTestCase('t.throwsAsync(f)'), noHeader: true}, // Shouldn't be triggered since it's not a test file
		{code: testCase('t.throwsAsync(f)'), noHeader: true}, // Shouldn't be triggered since it's not a test file
	],
	invalid: [
		{
			code: testCase('t.throwsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: testCase('t.notThrowsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: asyncTestCase('t.throwsAsync(f)'),
			output: asyncTestCase('await t.throwsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		{
			code: asyncTestCase('t.notThrowsAsync(f)'),
			output: asyncTestCase('await t.notThrowsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
		// Alternative test object names for t.try() callbacks
		{
			code: asyncTestCase('tt.throwsAsync(f)'),
			output: asyncTestCase('await tt.throwsAsync(f)'),
			errors: [{
				messageId: 'use-t-throws-async-well',
			}],
		},
	],
});

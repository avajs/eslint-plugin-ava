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
		'test.skipIf(process.platform === \'win32\')(t => { t.pass(); });',
		'test.runIf(isLinux)(t => { t.pass(); });',
		'test.skipIf(false)(t => { t.pass(); });',
		'test.runIf(true)(t => { t.pass(); });',
		'const skip = false; test.skipIf(skip)(t => { t.pass(); });',
		// Globals depend on the Node.js version that runs the tests
		'test.runIf(!Promise.withResolvers)(t => { t.pass(); });',
		'test.skipIf(Array.prototype.toSorted)(t => { t.pass(); });',
		'test.runIf(Object.hasOwn === undefined)(t => { t.pass(); });',
		'function check() { return test.runIf(!Promise.withResolvers)(t => { t.pass(); }); }',
		// Missing condition is reported by `no-invalid-modifier-chain`
		'test.runIf()(t => { t.pass(); });',
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
		// A constant condition always skips the test
		{
			code: 'test.skipIf(true)(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [],
			}],
		},
		{
			code: 'test.runIf(false)(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 6,
				suggestions: [],
			}],
		},
		{
			code: 'test.serial.skipIf(1)(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 13,
				suggestions: [],
			}],
		},
		{
			code: 'const skip = true; test.skipIf(skip)(t => { t.pass(); });',
			errors: [{messageId, suggestions: []}],
		},
		{
			code: 'test.skipIf(false).runIf(0)(t => { t.pass(); });',
			errors: [{
				messageId,
				line: 2,
				column: 20,
				suggestions: [],
			}],
		},
	],
});

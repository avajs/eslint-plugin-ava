import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-todo-test.js';

const ruleTester = new RuleTester();

ruleTester.run('no-todo-test', rule, {
	valid: [
		'test("my test name", t => { t.pass(); });',
		'test.only("my test name", t => { t.pass(); });',
		'notTest.todo(t => { t.pass(); });',
		// Shouldn't be triggered since it's not a test file
		{code: 'test.todo("my test name");', noHeader: true},
	],
	invalid: [
		{
			code: 'test.todo("my test name");',
			errors: [{
				messageId: 'no-todo-test',
				suggestions: [{
					messageId: 'no-todo-test-suggestion',
					output: 'test("my test name");',
				}],
			}],
		},
	],
});

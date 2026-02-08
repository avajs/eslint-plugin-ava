import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-duplicate-modifiers.js';

const ruleTester = new RuleTester();

const modifiers = [
	'after',
	'afterEach',
	'always',
	'before',
	'beforeEach',
	'failing',
	'only',
	'serial',
	'skip',
	'todo',
];

const valid = modifiers.map(modifier => `test.${modifier}(t => {});`);
const invalid = modifiers.map(modifier => ({
	code: `test.${modifier}.${modifier}(t => {});`,
	output: `test.${modifier}(t => {});`,
	errors: [
		{
			messageId: 'no-duplicate-modifiers',
			line: 2,
			column: 7 + modifier.length,
		},
	],
}));

ruleTester.run('no-duplicate-modifiers', rule, {
	valid: [...valid,
		'test(t => {});',
		'test.after.always(t => {});',
		'test.afterEach.always(t => {});',
		// Shouldn't be triggered since it's not a test file
		{code: 'test.serial.serial(t => {});', noHeader: true}],
	invalid,
});

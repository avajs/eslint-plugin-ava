import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-duplicate-modifiers.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';

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

const valid = modifiers.map(modifier => `${header}test.${modifier}(t => {});`);
const invalid = modifiers.map(modifier => ({
	code: `${header}test.${modifier}.${modifier}(t => {});`,
	errors: [
		{
			messageId: 'no-duplicate-modifiers',
			line: 2,
			column: 7 + modifier.length,
		},
	],
}));

ruleTester.run('no-duplicate-modifiers', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [...valid,
		`${header}test(t => {});`,
		`${header}test.after.always(t => {});`,
		`${header}test.afterEach.always(t => {});`,
		// Shouldn't be triggered since it's not a test file
		'test.serial.serial(t => {});'],
	invalid,
});

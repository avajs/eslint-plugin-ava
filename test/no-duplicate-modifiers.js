import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-duplicate-modifiers';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const ruleError = {ruleId: 'no-duplicate-modifiers'};
const header = `const test = require('ava');\n`;

const modifiers = [
	'after',
	'afterEach',
	'always',
	'before',
	'beforeEach',
	'cb',
	'failing',
	'only',
	'serial',
	'skip',
	'todo'
];

const valid = modifiers.map(modifier => `${header} test.${modifier}(t => {});`);
const invalid = modifiers.map(modifier => ({
	code: `${header} test.${modifier}.${modifier}(t => {});`,
	errors: [
		Object.assign({}, ruleError, {message: `Duplicate test modifier \`${modifier}\`.`})
	]
}));

ruleTester.run('no-duplicate-modifiers', rule, {
	valid: valid.concat([
		`${header} test(t => {});`,
		`${header} test.cb.only(t => {});`,
		`${header} test.after.always(t => {});`,
		`${header} test.afterEach.always(t => {});`,
		`${header} test.failing.cb(t => {});`,
		// Shouldn't be triggered since it's not a test file
		`test.serial.serial(t => {});`
	]),
	invalid: invalid.concat([
		{
			code: `${header} test.serial.cb.only.serial(t => {});`,
			errors: [
				Object.assign({}, ruleError, {message: 'Duplicate test modifier `serial`.'})
			]
		}
	])
});

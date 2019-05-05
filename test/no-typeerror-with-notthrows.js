import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-typeerror-with-notthrows';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-typerror-with-notthrows'}];

const header = `const test = require('ava');\n`; // eslint-disable-line quotes

ruleTester.run('no-typeerror-with-notthrows', rule, {
	valid: [
		`${header} test('some test',t => {t.notThrows(() => {t.pass();});});`,
		`${header} test(t => {t.notThrows(() => {t.pass();});});`,
		`${header} test(t => {t.throws(() => {t.pass();}, TypeError);});`,
		`${header} test(t => {t.end(); })`,
		`${header} test('some test',t => {t.notThrows(() => {t.pass();}, true);});`,
		`${header} test('some test',t => {t.notThrows(() => {t.pass();}, 'some string');});`,
		`${header} test('some test',t => {t.notThrows(() => {t.pass();}, {firstName:'some', lastName: 'object'});});`
	],
	invalid: [
		{
			code: `${header} test(t => {t.notThrows(() => {t.pass();}, TypeError);});`,
			errors
		},
		{
			code: `${header} test('some test',t => {t.notThrows(() => {t.pass();}, TypeError);});`,
			errors
		}
	]
});

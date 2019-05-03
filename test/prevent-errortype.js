import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/prevent-errortype';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'prevent-errortype'}];

const header = 'const test = require(\'ava\');\n';

ruleTester.run('prevent-errortype', rule, {
	valid: [
		header + 'test(\'some test\',t => {t.notThrows(() => {t.pass();});});',
		header + 'test(t => {t.notThrows(() => {t.pass();});});',
		header + 'test(t => {t.throws(() => {t.pass();}, TypeError);});',
		header + 'test(t => {t.end(); });'
	],
	invalid: [
		{
			code: header + 'test(t => {t.notThrows(() => {t.pass();}, TypeError);});',
			errors
		},
		{
			code: header + 'test(\'some test\',t => {t.notThrows(() => {t.pass();}, TypeError);});',
			errors
		}
	]
});

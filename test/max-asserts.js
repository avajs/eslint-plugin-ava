import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/max-asserts';

const ruleTester = new RuleTester({
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'max-asserts'}];
const header = `const test = require('ava');\n`;
function nbAssertions(n) {
	return Array.from({length: n}).map(() => 't.is(1, 1);').join('\n');
}

test(() => {
	ruleTester.run('max-asserts', rule, {
		valid: [
			`${header} test(function (t) { ${nbAssertions(3)} });`,
			`${header}
				test(function (t) { ${nbAssertions(3)} });
				test(function (t) { ${nbAssertions(3)} });
			`,
			`${header} test(function (t) { t.plan(5); ${nbAssertions(5)} });`,
			`${header} test(function (t) { t.is.skip(1, 1); ${nbAssertions(4)} });`,
			`${header} test.cb(function (t) { ${nbAssertions(5)} t.end(); });`,
			{
				code: `${header} test(function (t) { ${nbAssertions(3)} });`,
				options: [3]
			},
			{
				code: `${header} test(function (t) { notT.is(1, 1); notT.is(1, 1); notT.is(1, 1); });`,
				options: [2]
			},
			// shouldn't be triggered since it's not a test file
			`test(function (t) { ${nbAssertions(10)} });`
		],
		invalid: [
			{
				code: `${header} test(function (t) { ${nbAssertions(6)} });`,
				errors
			},
			{
				code: `${header}
					test(function (t) { ${nbAssertions(3)} });
					test(function (t) { ${nbAssertions(6)} });
				`,
				errors
			},
			{
				code: `${header} test(function (t) { t.plan(5); ${nbAssertions(6)} });`,
				errors
			},
			{
				code: `${header} test(function (t) { t.skip.is(1, 1); ${nbAssertions(5)} });`,
				errors
			},
			{
				code: `${header} test.cb(function (t) { ${nbAssertions(6)} t.end(); });`,
				errors
			},
			{
				code: `${header} test(function (t) { ${nbAssertions(4)} });`,
				options: [3],
				errors
			}
		]
	});
});

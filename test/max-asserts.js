import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/max-asserts.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';

function nbAssertions(n) {
	return Array.from({length: n}).map(() => 't.is(1, 1);').join('\n');
}

const maxAssertsError = (max, found) => [{message: `Expected at most ${max} assertions, but found ${found}.`}];

ruleTester.run('max-asserts', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		`${header} test(t => { ${nbAssertions(3)} });`,
		`${header}
			test(t => { ${nbAssertions(3)} });
			test(t => { ${nbAssertions(3)} });
		`,
		`${header} test(t => { t.plan(5); ${nbAssertions(5)} });`,
		`${header} test(t => { t.is.skip(1, 1); ${nbAssertions(4)} });`,
		{
			code: `${header} test(t => { ${nbAssertions(3)} });`,
			options: [{max: 3}],
		},
		{
			code: `${header} test(t => { notT.is(1, 1); notT.is(1, 1); notT.is(1, 1); });`,
			options: [{max: 2}],
		},
		`${header} test(t => { t.context.bar(); ${nbAssertions(5)} });`,
		`${header} test(t => { ${'t.context.is(1, 1); '.repeat(6)}});`,
		`${header} test(t => { ${'foo.t.is(1, 1); '.repeat(6)}});`,
		// Shouldn't be triggered since it's not a test file
		`test(t => { ${nbAssertions(10)} });`,
	],
	invalid: [
		{
			code: `${header} test(t => { ${nbAssertions(6)} });`,
			errors: maxAssertsError(5, 6),
		},
		{
			code: `${header}
				test(t => { ${nbAssertions(3)} });
				test(t => { ${nbAssertions(6)} });
			`,
			errors: maxAssertsError(5, 6),
		},
		{
			code: `${header} test(t => { t.plan(5); ${nbAssertions(6)} });`,
			errors: maxAssertsError(5, 6),
		},
		{
			code: `${header} test(t => { t.skip.is(1, 1); ${nbAssertions(5)} });`,
			errors: maxAssertsError(5, 6),
		},
		{
			code: `${header} test(t => { ${nbAssertions(4)} });`,
			options: [{max: 3}],
			errors: maxAssertsError(3, 4),
		},
		{
			code: `${header} test(t => { ${nbAssertions(10)} });`,
			errors: maxAssertsError(5, 10),
		},
		{
			code: `${header} test(t => { ${nbAssertions(10)} }); test(t => { ${nbAssertions(10)} });`,
			errors: [...maxAssertsError(5, 10), ...maxAssertsError(5, 10)], // Should have two errors, one per test
		},
	],
});

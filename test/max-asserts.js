import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/max-asserts.js';

const ruleTester = new RuleTester();

function nbAssertions(n) {
	return Array.from({length: n}).map(() => 't.is(1, 1);').join('\n');
}

const maxAssertsError = [{messageId: 'max-asserts'}];

ruleTester.run('max-asserts', rule, {
	valid: [
		`test(t => { ${nbAssertions(3)} });`,
		`test(t => { ${nbAssertions(3)} });
			test(t => { ${nbAssertions(3)} });
		`,
		`test(t => { t.plan(5); ${nbAssertions(5)} });`,
		`test(t => { t.is.skip(1, 1); ${nbAssertions(4)} });`,
		{
			code: `test(t => { ${nbAssertions(3)} });`,
			options: [{max: 3}],
		},
		{
			code: 'test(t => { notT.is(1, 1); notT.is(1, 1); notT.is(1, 1); });',
			options: [{max: 2}],
		},
		`test(t => { t.context.bar(); ${nbAssertions(5)} });`,
		`test(t => { ${'t.context.is(1, 1); '.repeat(6)}});`,
		`test(t => { ${'foo.t.is(1, 1); '.repeat(6)}});`,
		// Shouldn't be triggered since it's not a test file
		{code: `test(t => { ${nbAssertions(10)} });`, noHeader: true},
	],
	invalid: [
		{
			code: `test(t => { ${nbAssertions(6)} });`,
			errors: maxAssertsError,
		},
		{
			code: `test(t => { ${nbAssertions(3)} });
				test(t => { ${nbAssertions(6)} });
			`,
			errors: maxAssertsError,
		},
		{
			code: `test(t => { t.plan(5); ${nbAssertions(6)} });`,
			errors: maxAssertsError,
		},
		{
			code: `test(t => { t.skip.is(1, 1); ${nbAssertions(5)} });`,
			errors: maxAssertsError,
		},
		{
			code: `test(t => { ${nbAssertions(4)} });`,
			options: [{max: 3}],
			errors: maxAssertsError,
		},
		{
			code: `test(t => { ${nbAssertions(10)} });`,
			errors: maxAssertsError,
		},
		{
			code: `test(t => { ${nbAssertions(10)} }); test(t => { ${nbAssertions(10)} });`,
			errors: [...maxAssertsError, ...maxAssertsError],
		},
		// Alternative test object names for t.try() callbacks
		{
			code: `test(t => { ${'tt.is(1, 1); '.repeat(6)}});`,
			errors: maxAssertsError,
		},
	],
});

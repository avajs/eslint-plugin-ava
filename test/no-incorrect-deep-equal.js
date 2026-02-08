import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-incorrect-deep-equal.js';

const ruleTester = new RuleTester();

const error = {
	messageId: 'no-deep-equal-with-primitive',
};

ruleTester.run('no-incorrect-deep-equal', rule, {
	valid: [
		`
			test('x', t => {
				t.deepEqual(expression, otherExpression);
			});
		`,
		`
			test('x', t => {
				t.deepEqual(expression, {});
			});
		`,
		`
			test('x', t => {
				t.deepEqual(expression, []);
			});
		`,
		`
			test('x', t => {
				t.notDeepEqual(expression, []);
			});
		`,
		`
			test('x', t => {
				t.deepEqual(expression, /regex/);
			});
		`,
		`
			test('x', t => {
				t.deepEqual(/regex/, expression);
			});
		`,
	],
	invalid: [
		{
			code: `
				test('x', t => {
					t.deepEqual(expression, 'foo');
				});
			`,
			output: `
				test('x', t => {
					t.is(expression, 'foo');
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual('foo', expression);
				});
			`,
			output: `
				test('x', t => {
					t.is('foo', expression);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual(expression, 'foo');
				});
			`,
			output: `
				test('x', t => {
					t.not(expression, 'foo');
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual('foo', expression);
				});
			`,
			output: `
				test('x', t => {
					t.not('foo', expression);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual(expression, 1);
				});
			`,
			output: `
				test('x', t => {
					t.is(expression, 1);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual(expression, \`foo\${bar}\`);
				});
			`,
			output: `
				test('x', t => {
					t.is(expression, \`foo\${bar}\`);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual(\`foo\${bar}\`, expression);
				});
			`,
			output: `
				test('x', t => {
					t.is(\`foo\${bar}\`, expression);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual(expression, \`foo\${bar}\`);
				});
			`,
			output: `
				test('x', t => {
					t.not(expression, \`foo\${bar}\`);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual(\`foo\${bar}\`, expression);
				});
			`,
			output: `
				test('x', t => {
					t.not(\`foo\${bar}\`, expression);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual(expression, null);
				});
			`,
			output: `
				test('x', t => {
					t.is(expression, null);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual(null, expression);
				});
			`,
			output: `
				test('x', t => {
					t.is(null, expression);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual(expression, null);
				});
			`,
			output: `
				test('x', t => {
					t.not(expression, null);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual(null, expression);
				});
			`,
			output: `
				test('x', t => {
					t.not(null, expression);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual(expression, undefined);
				});
			`,
			output: `
				test('x', t => {
					t.is(expression, undefined);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual(undefined, expression);
				});
			`,
			output: `
				test('x', t => {
					t.is(undefined, expression);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual(expression, undefined);
				});
			`,
			output: `
				test('x', t => {
					t.not(expression, undefined);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual(undefined, expression);
				});
			`,
			output: `
				test('x', t => {
					t.not(undefined, expression);
				});
			`,
			errors: [error],
		},
	],
});

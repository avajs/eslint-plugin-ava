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
		// String message argument (3rd arg) should not trigger the rule
		`
			test('x', t => {
				t.deepEqual(expression, otherExpression, 'message');
			});
		`,
		// Non-assertion method should not be flagged
		`
			test('x', t => {
				t.plan(1);
			});
		`,
		// Not a test object
		`
			test('x', t => {
				foo.deepEqual(expression, 'bar');
			});
		`,
		// Unary minus on non-literal should not be flagged
		`
			test('x', t => {
				t.deepEqual(expression, -otherExpression);
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
		// Boolean literals
		{
			code: `
				test('x', t => {
					t.deepEqual(expression, true);
				});
			`,
			output: `
				test('x', t => {
					t.is(expression, true);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual(false, expression);
				});
			`,
			output: `
				test('x', t => {
					t.is(false, expression);
				});
			`,
			errors: [error],
		},
		// .skip variants
		{
			code: `
				test('x', t => {
					t.deepEqual.skip(expression, 'foo');
				});
			`,
			output: `
				test('x', t => {
					t.is.skip(expression, 'foo');
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual.skip(expression, 'foo');
				});
			`,
			output: `
				test('x', t => {
					t.not.skip(expression, 'foo');
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual.skip(expression, undefined);
				});
			`,
			output: `
				test('x', t => {
					t.is.skip(expression, undefined);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual.skip(expression, \`template\`);
				});
			`,
			output: `
				test('x', t => {
					t.is.skip(expression, \`template\`);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual.skip(expression, null);
				});
			`,
			output: `
				test('x', t => {
					t.not.skip(expression, null);
				});
			`,
			errors: [error],
		},
		// Primitive as first argument with .skip
		{
			code: `
				test('x', t => {
					t.deepEqual.skip(42, expression);
				});
			`,
			output: `
				test('x', t => {
					t.is.skip(42, expression);
				});
			`,
			errors: [error],
		},
		// Negative number literals
		{
			code: `
				test('x', t => {
					t.deepEqual(expression, -1);
				});
			`,
			output: `
				test('x', t => {
					t.is(expression, -1);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.deepEqual(-1, expression);
				});
			`,
			output: `
				test('x', t => {
					t.is(-1, expression);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual(expression, -1);
				});
			`,
			output: `
				test('x', t => {
					t.not(expression, -1);
				});
			`,
			errors: [error],
		},
		{
			code: `
				test('x', t => {
					t.notDeepEqual(-1, expression);
				});
			`,
			output: `
				test('x', t => {
					t.not(-1, expression);
				});
			`,
			errors: [error],
		},
	],
});

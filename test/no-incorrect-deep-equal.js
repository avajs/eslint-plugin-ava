import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/no-incorrect-deep-equal';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const error = {
	ruleId: 'no-incorrect-deep-equal',
	messageId: 'no-deep-equal-with-primative'
};

const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-incorrect-deep-equal', rule, {
	valid: [
		`
			${header}
			test(t => {
				t.deepEqual(expression, otherExpression);
			});
		`,
		`
			${header}
			test(t => {
				t.deepEqual(expression, {});
			});
		`,
		`
			${header}
			test(t => {
				t.deepEqual(expression, []);
			});
		`,
		`
			${header}
			test(t => {
				t.notDeepEqual(expression, []);
			});
		`
	],
	invalid: [
		{
			code: `
				${header}
				test('x', t => {
					t.deepEqual(expression, 'foo');
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.is(expression, 'foo');
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.deepEqual('foo', expression);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.is('foo', expression);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.notDeepEqual(expression, 'foo');
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.not(expression, 'foo');
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.notDeepEqual('foo', expression);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.not('foo', expression);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.deepEqual(expression, 1);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.is(expression, 1);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.deepEqual(expression, \`foo\${bar}\`);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.is(expression, \`foo\${bar}\`);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.deepEqual(\`foo\${bar}\`, expression);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.is(\`foo\${bar}\`, expression);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.notDeepEqual(expression, \`foo\${bar}\`);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.not(expression, \`foo\${bar}\`);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.notDeepEqual(\`foo\${bar}\`, expression);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.not(\`foo\${bar}\`, expression);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.deepEqual(expression, null);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.is(expression, null);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.deepEqual(null, expression);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.is(null, expression);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.notDeepEqual(expression, null);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.not(expression, null);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.notDeepEqual(null, expression);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.not(null, expression);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.deepEqual(expression, undefined);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.is(expression, undefined);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.deepEqual(undefined, expression);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.is(undefined, expression);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.notDeepEqual(expression, undefined);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.not(expression, undefined);
				});
			`,
			errors: [error]
		},
		{
			code: `
				${header}
				test('x', t => {
					t.notDeepEqual(undefined, expression);
				});
			`,
			output: `
				${header}
				test('x', t => {
					t.not(undefined, expression);
				});
			`,
			errors: [error]
		}
	]
});

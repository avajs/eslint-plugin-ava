
import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import {outdent} from 'outdent';
import rule from '../rules/hooks-order';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const errors = [{ruleId: 'no-todo-test'}];
const header = 'const test = require(\'ava\');\n';

ruleTester.run('no-todo-test', rule, {
	valid: [
		outdent`
			${header}

			test.before((t) => {
				doFoo();
			});

			test.after((t) => {
				doFoo();
			});

			test.after.always((t) => {
				doFoo();
			});

			test.beforeEach((t) => {
				doFoo();
			});

			test.afterEach((t) => {
				doFoo();
			});

			test.afterEach.always((t) => {
				doFoo();
			});

			test('foo', (t) => {
				t.true(true);
			});
		`
	],
	invalid: [
		{
			code: outdent`
				${header}
				test.after((t) => {
					doFoo();
				});

				test.before((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test.after.always((t) => {
					doFoo();
				});

				test.before((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test.beforeEach((t) => {
					doFoo();
				});

				test.before((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test.afterEach((t) => {
					doFoo();
				});

				test.before((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test.afterEach.always((t) => {
					doFoo();
				});

				test.before((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test('foo', (t) => {
					t.true(true);
				});

				test.before((t) => {
					doFoo();
				});
			`,
			errors
		},

		{
			code: outdent`
				${header}
				test.after.always((t) => {
					doFoo();
				});

				test.after((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test.beforeEach((t) => {
					doFoo();
				});

				test.after((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test.afterEach((t) => {
					doFoo();
				});

				test.after((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test.afterEach.always((t) => {
					doFoo();
				});

				test.after((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test('foo', (t) => {
					t.true(true);
				});

				test.after((t) => {
					doFoo();
				});
			`,
			errors
		},

		{
			code: outdent`
				${header}
				test.afterEach((t) => {
					doFoo();
				});

				test.beforeEach((t) => {
					doFoo();
				});

				test('foo', (t) => {
					t.true(true);
				});
			`,
			errors
		},
		{
			code: outdent`
				${header}
				test('foo', (t) => {
					t.true(true);
				});

				test.beforeEach((t) => {
					doFoo();
				});
			`,
			errors
		},

		{
			code: outdent`
				${header}
				test('foo', (t) => {
					t.true(true);
				});

				test.afterEach((t) => {
					doFoo();
				});
			`,
			errors
		}
	]
});

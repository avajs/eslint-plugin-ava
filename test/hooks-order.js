import RuleTester from './helpers/rule-tester.js';
import {outdent} from 'outdent';
import rule from '../rules/hooks-order.js';

const ruleTester = new RuleTester();

const errors = [{messageId: 'hooks-order'}];

ruleTester.run('hooks-order', rule, {
	valid: [
		outdent`
			test.before(t => {
				doFoo();
			});

			test.after(t => {
				doFoo();
			});

			test.after.always(t => {
				doFoo();
			});

			test.beforeEach(t => {
				doFoo();
			});

			test.afterEach(t => {
				doFoo();
			});

			test.afterEach.always(t => {
				doFoo();
			});

			test('foo', t => {
				t.true(true);
			});
		`,
		outdent`
			test.before(t => {
				doFoo();
			});

			console.log('foo');

			test.after.always(t => {
				doFoo();
			});

			const foo = 'foo';

			test.afterEach(t => {
				doFoo();
			});

			test('foo', t => {
				t.true(true);
			});
		`,
		{
			code: outdent`
				test.before(t => {
					doFoo();
				});

				test.after(t => {
					doFoo();
				});

				test.after.always(t => {
					doFoo();
				});

				test.beforeEach(t => {
					doFoo();
				});

				test.afterEach(t => {
					doFoo();
				});

				test.afterEach.always(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			noHeader: true,
		},
		outdent`
			test.before(t => {
				doFoo();
			});

			test.after(t => {
				doFoo();
			});
		`,
		{
			code: outdent`
				test.after(t => {
					doFoo();
				});

				test.before(t => {
					doFoo();
				});
			`,
			noHeader: true,
		},
		outdent`
			test('foo', t => {
				t.true(true);
			});
		`,
	],
	invalid: [
		{
			code: outdent`
				test.after(t => {
					doFoo();
				});

				test.before(t => {
					doFoo();
				});
			`,
			output: outdent`
				test.before(t => {
					doFoo();
				});

				test.after(t => {
					doFoo();
				});
			`,
			errors,
		},
		{
			code: outdent`
				test.after(t => {
					doFoo();
				});

				test.before(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.before(t => {
					doFoo();
				});

				test.after(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test.after.always(t => {
					doFoo();
				});

				test.before(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.before(t => {
					doFoo();
				});

				test.after.always(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test('foo', t => {
					t.true(true);
				});

				test.after.always(t => {
					doFoo();
				});
			`,
			output: outdent`
				test.after.always(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test.beforeEach(t => {
					doFoo();
				});

				test.before(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.before(t => {
					doFoo();
				});

				test.beforeEach(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test.afterEach(t => {
					doFoo();
				});

				test.before(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.before(t => {
					doFoo();
				});

				test.afterEach(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test.afterEach.always(t => {
					doFoo();
				});

				test.before(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.before(t => {
					doFoo();
				});

				test.afterEach.always(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test('foo', t => {
					t.true(true);
				});

				test.before(t => {
					doFoo();
				});
			`,
			output: outdent`
				test.before(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},

		{
			code: outdent`
				test.after.always(t => {
					doFoo();
				});

				test.after(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.after(t => {
					doFoo();
				});

				test.after.always(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test.beforeEach(t => {
					doFoo();
				});

				test.after(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.after(t => {
					doFoo();
				});

				test.beforeEach(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test.afterEach(t => {
					doFoo();
				});

				test.after(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.after(t => {
					doFoo();
				});

				test.afterEach(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test.afterEach.always(t => {
					doFoo();
				});

				test.after(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.after(t => {
					doFoo();
				});

				test.afterEach.always(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test('foo', t => {
					t.true(true);
				});

				test.after(t => {
					doFoo();
				});
			`,
			output: outdent`
				test.after(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},

		{
			code: outdent`
				test.afterEach(t => {
					doFoo();
				});

				test.beforeEach(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			output: outdent`
				test.beforeEach(t => {
					doFoo();
				});

				test.afterEach(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},
		{
			code: outdent`
				test('foo', t => {
					t.true(true);
				});

				test.beforeEach(t => {
					doFoo();
				});
			`,
			output: outdent`
				test.beforeEach(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},

		{
			code: outdent`
				test('foo', t => {
					t.true(true);
				});

				test.afterEach(t => {
					doFoo();
				});
			`,
			output: outdent`
				test.afterEach(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},

		{
			code: outdent`
				test('foo', t => {
					t.true(true);
				});

				test.afterEach.always(t => {
					doFoo();
				});
			`,
			output: outdent`
				test.afterEach.always(t => {
					doFoo();
				});

				test('foo', t => {
					t.true(true);
				});
			`,
			errors,
		},

		{
			code: outdent`
				test.after(t => {
					doFoo();
				});

				console.log('foo');

				test.before(t => {
					doFoo();
				});
			`,
			output: null,
			errors,
		},
		{
			code: outdent`
				test.after(t => {
					doFoo();
				});

				// comments
				test.before(t => {
					doFoo();
				});
			`,
			output: outdent`
				// comments
				test.before(t => {
					doFoo();
				});

				test.after(t => {
					doFoo();
				});
			`,
			errors,
		},
		{
			code: outdent`
				test.after(t => {
					doFoo();
				});

				/* comments */
				test.before(t => {
					doFoo();
				});
			`,
			output: outdent`
				/* comments */
				test.before(t => {
					doFoo();
				});

				test.after(t => {
					doFoo();
				});
			`,
			errors,
		},
	],
});

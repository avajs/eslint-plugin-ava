import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import {outdent} from 'outdent';
import rule from '../rules/hooks-order.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const errors = [{messageId: 'hooks-order'}];
const header = 'const test = require(\'ava\');';

ruleTester.run('no-todo-test', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		outdent`
			${header}

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
			${header}

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
			${header}

			test.before(t => {
				doFoo();
			});

			test.after(t => {
				doFoo();
			});
		`,
		outdent`
			test.after(t => {
				doFoo();
			});

			test.before(t => {
				doFoo();
			});
		`,
		outdent`
			${header}

			test('foo', t => {
				t.true(true);
			});
		`,
	],
	invalid: [
		{
			code: outdent`
				${header}

				test.after(t => {
					doFoo();
				});

				test.before(t => {
					doFoo();
				});
			`,
			output: outdent`
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

				test('foo', t => {
					t.true(true);
				});

				test.after.always(t => {
					doFoo();
				});
			`,
			output: outdent`
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

				test('foo', t => {
					t.true(true);
				});

				test.before(t => {
					doFoo();
				});
			`,
			output: outdent`
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

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
				${header}

				test('foo', t => {
					t.true(true);
				});

				test.after(t => {
					doFoo();
				});
			`,
			output: outdent`
				${header}

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
				${header}

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
				${header}

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
				${header}

				test('foo', t => {
					t.true(true);
				});

				test.beforeEach(t => {
					doFoo();
				});
			`,
			output: outdent`
				${header}

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
				${header}

				test('foo', t => {
					t.true(true);
				});

				test.afterEach(t => {
					doFoo();
				});
			`,
			output: outdent`
				${header}

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
				${header}

				test('foo', t => {
					t.true(true);
				});

				test.afterEach.always(t => {
					doFoo();
				});
			`,
			output: outdent`
				${header}

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
				${header}

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
				${header}

				test.after(t => {
					doFoo();
				});

				// comments
				test.before(t => {
					doFoo();
				});
			`,
			output: outdent`
				${header}

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
				${header}

				test.after(t => {
					doFoo();
				});

				/* comments */
				test.before(t => {
					doFoo();
				});
			`,
			output: outdent`
				${header}

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

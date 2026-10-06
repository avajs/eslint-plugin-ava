import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-invalid-modifier-chain.js';

const ruleTester = new RuleTester();

const error = (chain, suggestions) => ({
	message: `Invalid test modifier chain \`.${chain}\`.`,
	...(suggestions && {suggestions}),
});

const suggestion = (removed, output) => ({
	messageId: 'no-invalid-modifier-chain-suggestion',
	data: {removed},
	output,
});

ruleTester.run('no-invalid-modifier-chain', rule, {
	valid: [
		// Tests
		'test(t => {});',
		'test.failing(t => {});',
		'test.only(t => {});',
		'test.serial(t => {});',
		'test.skip(t => {});',
		'test.failing.only(t => {});',
		'test.failing.skip(t => {});',
		'test.serial.failing(t => {});',
		'test.serial.only(t => {});',
		'test.serial.skip(t => {});',
		'test.serial.failing.only(t => {});',
		'test.serial.failing.skip(t => {});',
		'test.todo("title");',
		'test.serial.todo("title");',

		// Before/beforeEach hooks
		'test.before(t => {});',
		'test.before.skip(t => {});',
		'test.beforeEach(t => {});',
		'test.beforeEach.skip(t => {});',
		'test.serial.before(t => {});',
		'test.serial.before.skip(t => {});',
		'test.serial.beforeEach(t => {});',
		'test.serial.beforeEach.skip(t => {});',

		// After/afterEach hooks (with always)
		'test.after(t => {});',
		'test.after.skip(t => {});',
		'test.after.always(t => {});',
		'test.after.always.skip(t => {});',
		'test.afterEach(t => {});',
		'test.afterEach.skip(t => {});',
		'test.afterEach.always(t => {});',
		'test.afterEach.always.skip(t => {});',
		'test.serial.after(t => {});',
		'test.serial.after.skip(t => {});',
		'test.serial.after.always(t => {});',
		'test.serial.after.always.skip(t => {});',
		'test.serial.afterEach(t => {});',
		'test.serial.afterEach.skip(t => {});',
		'test.serial.afterEach.always(t => {});',
		'test.serial.afterEach.always.skip(t => {});',

		// Special
		'test.macro(t => {});',

		// CJS/ESM interop (default is stripped)
		'test.default(t => {});',
		'test.default.serial(t => {});',
		// Named serial export
		{code: 'import {serial} from \'ava\'; serial(t => {});', noHeader: true},
		{code: 'import {serial} from \'ava\'; serial.before(t => {});', noHeader: true},

		// Computed modifiers — can't statically analyze, should not report
		'test[\'only\'](t => {});',
		'test[\'serial\'][\'only\'](t => {});',
		'test.serial[\'only\'](t => {});',
		'test[\'serial\'].only(t => {});',

		// Conditional modifiers
		'test.skipIf(condition)(t => {});',
		'test.runIf(condition)(t => {});',
		'test.serial.skipIf(condition)(t => {});',
		'test.failing.skipIf(condition)(t => {});',
		'test.serial.failing.runIf(condition)(t => {});',
		'test.skipIf(condition).serial(t => {});',
		'test.skipIf(condition).serial.failing(t => {});',
		'test.skipIf(condition).only(t => {});',
		'test.runIf(condition).serial.only(t => {});',
		'test.skipIf(condition).skip(t => {});',
		'test.skipIf(condition).todo("title");',
		'test.serial.runIf(condition).todo("title");',
		'test.skipIf(a).skipIf(b)(t => {});',
		'test.skipIf(a).serial.runIf(b)(t => {});',
		'test.default.skipIf(condition)(t => {});',
		'test.default.serial.skipIf(condition)(t => {});',
		'test.skipIf(condition).failing.only(t => {});',
		'test.skipIf(condition).serial.failing.skip(t => {});',
		'test.serial.failing.skipIf(condition).only(t => {});',
		'test.skipIf(a).failing.runIf(b).only(t => {});',
		'test.skipIf(...conditions)(t => {});',
		{code: 'import {serial} from \'ava\'; serial.skipIf(condition).only(t => {});', noHeader: true},
		{code: 'import {serial} from \'ava\'; serial.skipIf(condition)(t => {});', noHeader: true},
		{code: 'import {serial} from \'ava\'; serial.skipIf(condition).failing(t => {});', noHeader: true},
		'const linuxTest = test.runIf(isLinux); linuxTest(t => {});',

		// Not a test file
		{code: 'test.foo(t => {});', noHeader: true},
	],
	invalid: [
		// Wrong order (fixable)
		{
			code: 'test.only.serial(t => {});',
			output: 'test.serial.only(t => {});',
			errors: [error('only.serial')],
		},
		{
			code: 'test.failing.serial(t => {});',
			output: 'test.serial.failing(t => {});',
			errors: [error('failing.serial')],
		},
		{
			code: 'test.skip.serial(t => {});',
			output: 'test.serial.skip(t => {});',
			errors: [error('skip.serial')],
		},
		{
			code: 'test.skip.failing(t => {});',
			output: 'test.failing.skip(t => {});',
			errors: [error('skip.failing')],
		},
		{
			code: 'test.todo.serial("title");',
			output: 'test.serial.todo("title");',
			errors: [error('todo.serial')],
		},
		{
			code: 'test.always.after(t => {});',
			output: 'test.after.always(t => {});',
			errors: [error('always.after')],
		},
		{
			code: 'test.always.afterEach(t => {});',
			output: 'test.afterEach.always(t => {});',
			errors: [error('always.afterEach')],
		},
		{
			code: 'test.skip.before(t => {});',
			output: 'test.before.skip(t => {});',
			errors: [error('skip.before')],
		},
		{
			code: 'test.skip.beforeEach(t => {});',
			output: 'test.beforeEach.skip(t => {});',
			errors: [error('skip.beforeEach')],
		},
		{
			code: 'test.before.serial(t => {});',
			output: 'test.serial.before(t => {});',
			errors: [error('before.serial')],
		},

		// Wrong order with multiple modifiers (fixable)
		{
			code: 'test.skip.failing.serial(t => {});',
			output: 'test.serial.failing.skip(t => {});',
			errors: [error('skip.failing.serial')],
		},
		{
			code: 'test.always.skip.after(t => {});',
			output: 'test.after.always.skip(t => {});',
			errors: [error('always.skip.after')],
		},

		// Wrong order with default prefix (fixable)
		{
			code: 'test.default.only.serial(t => {});',
			output: 'test.default.serial.only(t => {});',
			errors: [error('only.serial')],
		},

		// Invalid combinations (suggestions)
		{
			code: 'test.only.skip(t => {});',
			output: null,
			errors: [error('only.skip', [
				suggestion('only', 'test.skip(t => {});'),
				suggestion('skip', 'test.only(t => {});'),
			])],
		},
		{
			code: 'test.serial.only.skip(t => {});',
			output: null,
			errors: [error('serial.only.skip', [
				suggestion('only', 'test.serial.skip(t => {});'),
				suggestion('skip', 'test.serial.only(t => {});'),
			])],
		},

		// Invalid modifiers on hooks (suggestions)
		{
			code: 'test.before.failing(t => {});',
			output: null,
			errors: [error('before.failing', [
				suggestion('before', 'test.failing(t => {});'),
				suggestion('failing', 'test.before(t => {});'),
			])],
		},
		{
			code: 'test.serial.before.only(t => {});',
			output: null,
			errors: [error('serial.before.only', [
				suggestion('before', 'test.serial.only(t => {});'),
				suggestion('only', 'test.serial.before(t => {});'),
			])],
		},
		{
			code: 'test.before.only(t => {});',
			output: null,
			errors: [error('before.only', [
				suggestion('before', 'test.only(t => {});'),
				suggestion('only', 'test.before(t => {});'),
			])],
		},
		{
			code: 'test.beforeEach.only(t => {});',
			output: null,
			errors: [error('beforeEach.only', [
				suggestion('beforeEach', 'test.only(t => {});'),
				suggestion('only', 'test.beforeEach(t => {});'),
			])],
		},
		{
			code: 'test.after.only(t => {});',
			output: null,
			errors: [error('after.only', [
				suggestion('after', 'test.only(t => {});'),
				suggestion('only', 'test.after(t => {});'),
			])],
		},
		{
			code: 'test.afterEach.only(t => {});',
			output: null,
			errors: [error('afterEach.only', [
				suggestion('afterEach', 'test.only(t => {});'),
				suggestion('only', 'test.afterEach(t => {});'),
			])],
		},
		{
			code: 'test.after.failing(t => {});',
			output: null,
			errors: [error('after.failing', [
				suggestion('after', 'test.failing(t => {});'),
				suggestion('failing', 'test.after(t => {});'),
			])],
		},
		{
			code: 'test.afterEach.failing(t => {});',
			output: null,
			errors: [error('afterEach.failing', [
				suggestion('afterEach', 'test.failing(t => {});'),
				suggestion('failing', 'test.afterEach(t => {});'),
			])],
		},
		{
			code: 'test.beforeEach.failing(t => {});',
			output: null,
			errors: [error('beforeEach.failing', [
				suggestion('beforeEach', 'test.failing(t => {});'),
				suggestion('failing', 'test.beforeEach(t => {});'),
			])],
		},

		// Invalid todo chains (suggestions)
		{
			code: 'test.todo.failing("title");',
			output: null,
			errors: [error('todo.failing', [
				suggestion('todo', 'test.failing("title");'),
				suggestion('failing', 'test.todo("title");'),
			])],
		},
		{
			code: 'test.todo.only("title");',
			output: null,
			errors: [error('todo.only', [
				suggestion('todo', 'test.only("title");'),
				suggestion('only', 'test.todo("title");'),
			])],
		},
		{
			code: 'test.todo.skip("title");',
			output: null,
			errors: [error('todo.skip', [
				suggestion('todo', 'test.skip("title");'),
				suggestion('skip', 'test.todo("title");'),
			])],
		},

		// Invalid always usage
		{
			code: 'test.after.skip.always(t => {});',
			output: 'test.after.always.skip(t => {});',
			errors: [error('after.skip.always')],
		},
		{
			code: 'test.before.always(t => {});',
			output: null,
			errors: [error('before.always', [
				suggestion('always', 'test.before(t => {});'),
			])],
		},
		{
			code: 'test.always(t => {});',
			output: null,
			errors: [error('always', [
				suggestion('always', 'test(t => {});'),
			])],
		},
		{
			code: 'test.beforeEach.always(t => {});',
			output: null,
			errors: [error('beforeEach.always', [
				suggestion('always', 'test.beforeEach(t => {});'),
			])],
		},
		{
			code: 'test.serial.always(t => {});',
			output: null,
			errors: [error('serial.always', [
				suggestion('always', 'test.serial(t => {});'),
			])],
		},
		{
			code: 'test.foo.always(t => {});',
			output: null,
			errors: [error('foo.always')],
		},

		// Macro with other modifiers (suggestions)
		{
			code: 'test.serial.macro(t => {});',
			output: null,
			errors: [error('serial.macro', [
				suggestion('serial', 'test.macro(t => {});'),
				suggestion('macro', 'test.serial(t => {});'),
			])],
		},
		{
			code: 'test.macro.skip(t => {});',
			output: null,
			errors: [error('macro.skip', [
				suggestion('macro', 'test.skip(t => {});'),
				suggestion('skip', 'test.macro(t => {});'),
			])],
		},
		{
			code: 'test.failing.macro(t => {});',
			output: null,
			errors: [error('failing.macro', [
				suggestion('failing', 'test.macro(t => {});'),
				suggestion('macro', 'test.failing(t => {});'),
			])],
		},
		{
			code: 'import {serial} from \'ava\'; serial.macro(t => {});',
			output: null,
			noHeader: true,
			errors: [error('serial.macro', [
				suggestion('macro', 'import {serial} from \'ava\'; serial(t => {});'),
			])],
		},

		// Unknown modifiers (no fix, no suggestions)
		{
			code: 'test.foo(t => {});',
			output: null,
			errors: [error('foo')],
		},
		{
			code: 'test.cb(t => {});',
			output: null,
			errors: [error('cb')],
		},
		{
			code: 'test.onlu(t => {});',
			output: null,
			errors: [error('onlu')],
		},
		{
			code: 'test.beforeeach(t => {});',
			output: null,
			errors: [error('beforeeach')],
		},
		{
			code: 'test.test(t => {});',
			output: null,
			errors: [error('test')],
		},
		{
			code: 'test.c.only(t => {});',
			output: null,
			errors: [error('c.only')],
		},
		{
			code: 'test.foo.bar.baz(t => {});',
			output: null,
			errors: [error('foo.bar.baz')],
		},

		// Invalid with default prefix (no fix, no suggestions)
		{
			code: 'test.default.foo(t => {});',
			output: null,
			errors: [error('foo')],
		},
		{
			code: 'test.default.default(t => {});',
			output: null,
			errors: [error('default')],
		},
		{
			code: 'test.default.serial.serial(t => {});',
			output: 'test.default.serial(t => {});',
			errors: [error('serial.serial')],
		},

		// Wrong order + duplicate combo (fixable)
		{
			code: 'test.only.serial.serial(t => {});',
			output: 'test.serial.only(t => {});',
			errors: [error('only.serial.serial')],
		},

		// Named serial export (fixable)
		{
			code: 'import {serial} from \'ava\'; serial.serial(t => {});',
			output: 'import {serial} from \'ava\'; serial(t => {});',
			noHeader: true,
			errors: [error('serial.serial')],
		},
		{
			code: 'import {serial} from \'ava\'; serial.before.serial(t => {});',
			output: 'import {serial} from \'ava\'; serial.before(t => {});',
			noHeader: true,
			errors: [error('serial.before.serial')],
		},
		{
			code: 'import {serial as avaSerial} from \'ava\'; avaSerial.serial(t => {});',
			output: 'import {serial as avaSerial} from \'ava\'; avaSerial(t => {});',
			noHeader: true,
			errors: [error('serial.serial')],
		},

		// Duplicates (fixable)
		{
			code: 'test.serial.serial(t => {});',
			output: 'test.serial(t => {});',
			errors: [error('serial.serial')],
		},
		{
			code: 'test.serial.serial.serial(t => {});',
			output: 'test.serial(t => {});',
			errors: [error('serial.serial.serial')],
		},
		{
			code: 'test.afterEach.always.always(t => {});',
			output: 'test.afterEach.always(t => {});',
			errors: [error('afterEach.always.always')],
		},
		{
			code: 'test.before.before(t => {});',
			output: 'test.before(t => {});',
			errors: [error('before.before')],
		},
		{
			code: 'test.only.only(t => {});',
			output: 'test.only(t => {});',
			errors: [error('only.only')],
		},
		{
			code: 'test.skip.skip(t => {});',
			output: 'test.skip(t => {});',
			errors: [error('skip.skip')],
		},
		{
			code: 'test.failing.failing(t => {});',
			output: 'test.failing(t => {});',
			errors: [error('failing.failing')],
		},

		// Conditional modifiers in the wrong place (no fix, as it would remove the condition)
		{
			code: 'test.only.skipIf(condition)(t => {});',
			output: null,
			errors: [error('only.skipIf', [])],
		},
		{
			code: 'test.skip.runIf(condition)(t => {});',
			output: null,
			errors: [error('skip.runIf', [])],
		},
		{
			code: 'test.todo.skipIf(condition)("title");',
			output: null,
			errors: [error('todo.skipIf', [])],
		},
		{
			code: 'test.serial.only.runIf(condition)(t => {});',
			output: null,
			errors: [error('serial.only.runIf', [])],
		},
		{
			code: 'test.skipIf(condition).failing.serial(t => {});',
			output: null,
			errors: [error('skipIf.failing.serial', [])],
		},
		{
			code: 'test.skipIf(condition).foo(t => {});',
			output: null,
			errors: [error('skipIf.foo', [])],
		},
		{
			code: 'test.failing.skipIf(condition).todo("title");',
			output: null,
			errors: [error('failing.skipIf.todo', [])],
		},
		{
			code: 'test.skipIf(a).only.skipIf(b)(t => {});',
			output: null,
			errors: [error('skipIf.only.skipIf', [])],
		},
		{
			code: 'test.skipIf(condition).only.skip(t => {});',
			output: null,
			errors: [error('skipIf.only.skip', [])],
		},
		{
			code: 'test.default.only.skipIf(condition)(t => {});',
			output: null,
			errors: [error('only.skipIf', [])],
		},
		{
			code: 'import {serial} from \'ava\'; serial.only.skipIf(condition)(t => {});',
			noHeader: true,
			output: null,
			errors: [error('serial.only.skipIf', [])],
		},
		{
			code: 'import {serial} from \'ava\'; serial.skipIf(condition).serial(t => {});',
			noHeader: true,
			output: null,
			errors: [error('serial.skipIf.serial', [])],
		},

		// Missing condition
		{
			code: 'test.skipIf()(t => {});',
			output: null,
			errors: [{message: '`.skipIf()` requires a condition.', line: 2, column: 1}],
		},
		{
			code: 'test.serial.runIf().failing(t => {});',
			output: null,
			errors: [{message: '`.runIf()` requires a condition.'}],
		},
		{
			code: 'test.only.skipIf()(t => {});',
			output: null,
			errors: [
				{message: '`.skipIf()` requires a condition.'},
				error('only.skipIf', []),
			],
		},
		{
			code: 'test.skipIf(a).skipIf()(t => {});',
			output: null,
			errors: [{message: '`.skipIf()` requires a condition.'}],
		},
		{
			code: 'import {serial} from \'ava\'; serial.skipIf()(t => {});',
			noHeader: true,
			output: null,
			errors: [{message: '`.skipIf()` requires a condition.'}],
		},

		// AVA ignores the condition for hooks and macros
		{
			code: 'test.skipIf(condition).before(t => {});',
			output: null,
			errors: [error('skipIf.before', [])],
		},
		{
			code: 'test.skipIf(condition).after(t => {});',
			output: null,
			errors: [error('skipIf.after', [])],
		},
		{
			code: 'test.runIf(condition).afterEach.always(t => {});',
			output: null,
			errors: [error('runIf.afterEach.always', [])],
		},
		{
			code: 'test.serial.skipIf(condition).beforeEach(t => {});',
			output: null,
			errors: [error('serial.skipIf.beforeEach', [])],
		},
		{
			code: 'test.skipIf(condition).macro(t => {});',
			output: null,
			errors: [error('skipIf.macro', [])],
		},
		{
			code: 'test.skipIf(condition).serial.before(t => {});',
			output: null,
			errors: [error('skipIf.serial.before', [])],
		},
		{
			code: 'test.skipIf(condition).after.always.skip(t => {});',
			output: null,
			errors: [error('skipIf.after.always.skip', [])],
		},

		// Conditional modifiers after a hook
		{
			code: 'test.before.skipIf(condition)(t => {});',
			output: null,
			errors: [error('before.skipIf', [])],
		},
		{
			code: 'test.after.always.runIf(condition)(t => {});',
			output: null,
			errors: [error('after.always.runIf', [])],
		},
	],
});

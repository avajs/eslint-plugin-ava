import RuleTester from './helpers/rule-tester.js';
import rule from '../rules/no-duplicate-hooks.js';

const ruleTester = new RuleTester();

const error = hook => ({
	messageId: 'no-duplicate-hooks',
	data: {hook},
});

ruleTester.run('no-duplicate-hooks', rule, {
	valid: [
		// Single hook of each type
		'test.before(t => {}); test.after(t => {});',
		// Different hook types
		'test.before(t => {}); test.beforeEach(t => {});',
		// After and after.always are different
		'test.after(t => {}); test.after.always(t => {});',
		// AfterEach and afterEach.always are different
		'test.afterEach(t => {}); test.afterEach.always(t => {});',
		// All different hooks (including .always variants)
		'test.before(t => {}); test.after(t => {}); test.after.always(t => {}); test.beforeEach(t => {}); test.afterEach(t => {}); test.afterEach.always(t => {});',
		// Hooks with serial modifier (all different)
		'test.serial.before(t => {}); test.serial.after(t => {});',
		// Not a test file
		{code: 'test.before(t => {}); test.before(t => {});', noHeader: true},
	],
	invalid: [
		// Duplicate before
		{
			code: 'test.before(t => {}); test.before(t => {});',
			errors: [error('before')],
		},
		// Duplicate after
		{
			code: 'test.after(t => {}); test.after(t => {});',
			errors: [error('after')],
		},
		// Duplicate after.always
		{
			code: 'test.after.always(t => {}); test.after.always(t => {});',
			errors: [error('after.always')],
		},
		// Duplicate beforeEach
		{
			code: 'test.beforeEach(t => {}); test.beforeEach(t => {});',
			errors: [error('beforeEach')],
		},
		// Duplicate afterEach
		{
			code: 'test.afterEach(t => {}); test.afterEach(t => {});',
			errors: [error('afterEach')],
		},
		// Duplicate afterEach.always
		{
			code: 'test.afterEach.always(t => {}); test.afterEach.always(t => {});',
			errors: [error('afterEach.always')],
		},
		// Multiple duplicates
		{
			code: 'test.before(t => {}); test.before(t => {}); test.before(t => {});',
			errors: [error('before'), error('before')],
		},
		// Duplicate hooks with tests in between
		{
			code: 'test.before(t => {}); test("foo", t => { t.pass(); }); test.before(t => {});',
			errors: [error('before')],
		},
		// Multiple different hook types duplicated
		{
			code: 'test.before(t => {}); test.after(t => {}); test.before(t => {}); test.after(t => {});',
			errors: [error('before'), error('after')],
		},
		// Duplicate hooks with serial modifier
		{
			code: 'test.serial.before(t => {}); test.serial.before(t => {});',
			errors: [error('before')],
		},
		// Mix of serial and non-serial (both are the same hook type)
		{
			code: 'test.before(t => {}); test.serial.before(t => {});',
			errors: [error('before')],
		},
		// Duplicate after.always with serial
		{
			code: 'test.serial.after.always(t => {}); test.serial.after.always(t => {});',
			errors: [error('after.always')],
		},
		// Duplicate afterEach.always with serial
		{
			code: 'test.afterEach.always(t => {}); test.serial.afterEach.always(t => {});',
			errors: [error('afterEach.always')],
		},
		// Skipped hook still counts as the same hook type
		{
			code: 'test.before(t => {}); test.before.skip(t => {});',
			errors: [error('before')],
		},
		// Reversed modifier order (always.after is still after.always)
		{
			code: 'test.after.always(t => {}); test.always.after(t => {});',
			errors: [error('after.always')],
		},
	],
});

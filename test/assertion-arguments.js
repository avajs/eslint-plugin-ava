import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/assertion-arguments';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const missingError = 'Expected an assertion message, but found none.';
const foundError = 'Expected no assertion message, but found one.';
const tooFewError = n => `Not enough arguments. Expected at least ${n}.`;
const tooManyError = n => `Too many arguments. Expected at most ${n}.`;

const header = 'const test = require(\'ava\');';

function testCase(message, content, errorMessage, useHeader) {
	const testFn = `
		test(t => {
			${content}
		});
	`;

	return {
		errors: errorMessage && [{
			ruleId: 'assertion-arguments',
			message: errorMessage
		}],
		options: message ? [{message}] : [],
		code: (useHeader === false ? '' : header) + testFn
	};
}

ruleTester.run('assertion-arguments', rule, {
	valid: [
		testCase(false, 't.plan(1);'),
		testCase(false, 't.deepEqual({}, {}, \'message\');'),
		testCase(false, 't.fail(\'message\');'),
		testCase(false, 't.false(false, \'message\');'),
		testCase(false, 't.falsy(\'unicorn\', \'message\');'),
		testCase(false, 't.ifError(new Error(), \'message\');'),
		testCase(false, 't.is.skip(\'same\', \'same\', \'message\');'),
		testCase(false, 't.is(\'same\', \'same\', \'message\');'),
		testCase(false, 't.not(\'not\', \'same\', \'message\');'),
		testCase(false, 't.notDeepEqual({}, {a: true}, \'message\');'),
		testCase(false, 't.notThrows(Promise.resolve(), \'message\');'),
		testCase(false, 't.pass(\'message\');'),
		testCase(false, 't.regex(a, /a/, \'message\');'),
		testCase(false, 't.notRegex(a, /a/, \'message\');'),
		testCase(false, 't.skip.is(\'same\', \'same\', \'message\');'),
		testCase(false, 't.throws(Promise.reject(), Error, \'message\');'),
		testCase(false, 't.true(true, \'message\');'),
		testCase(false, 't.truthy(\'unicorn\', \'message\');'),
		testCase(false, 't.snapshot(value, \'message\');'),
		testCase(false, 't.context.plan();'),
		testCase(false, 't.teardown(() => {});'),
		testCase(false, 't.timeout(100);'),
		testCase(false, 'foo.t.plan();'),
		// Shouldn't be triggered since it's not a test file
		testCase(false, 't.true(true);', false, false),

		testCase(false, 't.deepEqual({}, {});'),
		testCase(false, 't.fail();'),
		testCase(false, 't.false(false);'),
		testCase(false, 't.falsy(\'unicorn\');'),
		testCase(false, 't.ifError(new Error());'),
		testCase(false, 't.is.skip(\'same\', \'same\');'),
		testCase(false, 't.is(\'same\', \'same\');'),
		testCase(false, 't.not(\'not\', \'same\');'),
		testCase(false, 't.notDeepEqual({}, {a: true});'),
		testCase(false, 't.notThrows(Promise.resolve());'),
		testCase(false, 't.pass();'),
		testCase(false, 't.regex(a, /a/);'),
		testCase(false, 't.notRegex(a, /a/);'),
		testCase(false, 't.skip.is(\'same\', \'same\');'),
		testCase(false, 't.throws(Promise.reject());'),
		testCase(false, 't.throws(Promise.reject(), Error);'),
		testCase(false, 't.true(true);'),
		testCase(false, 't.truthy(\'unicorn\');'),
		testCase(false, 't.snapshot(value);'),
		// Shouldn't be triggered since it's not a test file
		testCase(false, 't.true(true, \'message\');', [], false),

		testCase(false, 't.context.a(1, 2, 3, 4);'),
		testCase(false, 't.context.is(1, 2, 3, 4);'),
		testCase(false, 't.foo(1, 2, 3, 4);'),

		testCase('always', 't.plan(1);'),
		testCase('always', 't.pass(\'message\');'),
		testCase('always', 't.fail(\'message\');'),
		testCase('always', 't.truthy(\'unicorn\', \'message\');'),
		testCase('always', 't.falsy(\'unicorn\', \'message\');'),
		testCase('always', 't.true(true, \'message\');'),
		testCase('always', 't.false(false, \'message\');'),
		testCase('always', 't.is(\'same\', \'same\', \'message\');'),
		testCase('always', 't.not(\'not\', \'same\', \'message\');'),
		testCase('always', 't.deepEqual({}, {}, \'message\');'),
		testCase('always', 't.notDeepEqual({}, {a: true}, \'message\');'),
		testCase('always', 't.throws(Promise.reject(), Error, \'message\');'),
		testCase('always', 't.notThrows(Promise.resolve(), \'message\');'),
		testCase('always', 't.regex(a, /a/, \'message\');'),
		testCase('always', 't.notRegex(a, /a/, \'message\');'),
		testCase('always', 't.ifError(new Error(), \'message\');'),
		testCase('always', 't.skip.is(\'same\', \'same\', \'message\');'),
		testCase('always', 't.is.skip(\'same\', \'same\', \'message\');'),
		testCase('always', 't.snapshot(value, \'message\');'),
		testCase('always', 't.teardown(() => {});'),
		testCase('always', 't.timeout(100);'),
		testCase('always', 't.try(tt => tt.pass());'),
		testCase('always', 't.try(tt => tt.pass(), 1, 2);'),
		testCase('always', 't.try(\'title\', tt => tt.pass(), 1, 2);'),

		// Shouldn't be triggered since it's not a test file
		testCase('always', 't.true(true);', [], false),

		testCase('always', 't.context.a(1, 2, 3, 4);'),
		testCase('always', 't.context.is(1, 2, 3, 4);'),
		testCase('always', 't.foo(1, 2, 3, 4);'),

		testCase('never', 't.plan(1);'),
		testCase('never', 't.pass();'),
		testCase('never', 't.fail();'),
		testCase('never', 't.truthy(\'unicorn\');'),
		testCase('never', 't.falsy(\'unicorn\');'),
		testCase('never', 't.true(true);'),
		testCase('never', 't.false(false);'),
		testCase('never', 't.is(\'same\', \'same\');'),
		testCase('never', 't.not(\'not\', \'same\');'),
		testCase('never', 't.deepEqual({}, {});'),
		testCase('never', 't.notDeepEqual({}, {a: true});'),
		testCase('never', 't.throws(Promise.reject());'),
		testCase('never', 't.throws(Promise.reject(), Error);'),
		testCase('never', 't.notThrows(Promise.resolve());'),
		testCase('never', 't.regex(a, /a/);'),
		testCase('never', 't.notRegex(a, /a/);'),
		testCase('never', 't.ifError(new Error());'),
		testCase('never', 't.skip.is(\'same\', \'same\');'),
		testCase('never', 't.is.skip(\'same\', \'same\');'),
		testCase('never', 't.snapshot(value);'),
		testCase('never', 't.teardown(() => {});'),
		testCase('never', 't.timeout(100);'),
		testCase('never', 't.try(tt => tt.pass());'),
		testCase('never', 't.try(tt => tt.pass(), 1, 2);'),
		testCase('never', 't.try(\'title\', tt => tt.pass(), 1, 2);'),

		// Shouldn't be triggered since it's not a test file
		testCase('never', 't.true(true, \'message\');', [], false),

		testCase('never', 't.context.a(1, 2, 3, 4);'),
		testCase('never', 't.context.is(1, 2, 3, 4);'),
		testCase('never', 't.foo(1, 2, 3, 4);'),

		// Special case for `t.end()``
		testCase(false, 't.end();'),
		testCase(false, 't.end(error);'),
		testCase(false, 't.end.skip();'),
		testCase(false, 't.end.skip(error);'),
		testCase(false, 't.skip.end();'),
		testCase(false, 't.skip.end(error);'),
		testCase('always', 't.end();'),
		testCase('always', 't.end(error);'),
		testCase('always', 't.end.skip();'),
		testCase('always', 't.end.skip(error);'),
		testCase('always', 't.skip.end();'),
		testCase('always', 't.skip.end(error);'),
		testCase('never', 't.end();'),
		testCase('never', 't.end(error);'),
		testCase('never', 't.end.skip();'),
		testCase('never', 't.end.skip(error);'),
		testCase('never', 't.skip.end();'),
		testCase('never', 't.skip.end(error);')
	],
	invalid: [
		// Not enough arguments
		testCase(false, 't.plan();', tooFewError(1)),
		testCase(false, 't.truthy();', tooFewError(1)),
		testCase(false, 't.falsy();', tooFewError(1)),
		testCase(false, 't.true();', tooFewError(1)),
		testCase(false, 't.false();', tooFewError(1)),
		testCase(false, 't.is(\'same\');', tooFewError(2)),
		testCase(false, 't.not(\'not\');', tooFewError(2)),
		testCase(false, 't.deepEqual({});', tooFewError(2)),
		testCase(false, 't.notDeepEqual({});', tooFewError(2)),
		testCase(false, 't.throws();', tooFewError(1)),
		testCase(false, 't.notThrows();', tooFewError(1)),
		testCase(false, 't.regex(a);', tooFewError(2)),
		testCase(false, 't.notRegex(a);', tooFewError(2)),
		testCase(false, 't.ifError();', tooFewError(1)),
		testCase(false, 't.skip.is(\'same\');', tooFewError(2)),
		testCase(false, 't.is.skip(\'same\');', tooFewError(2)),
		testCase(false, 't.snapshot();', tooFewError(1)),
		testCase(false, 't.teardown();', tooFewError(1)),
		testCase(false, 't.timeout();', tooFewError(1)),
		testCase(false, 't.try();', tooFewError(1)),

		// Too many arguments
		testCase(false, 't.plan(1, \'extra argument\');', tooManyError(1)),
		testCase(false, 't.pass(\'message\', \'extra argument\');', tooManyError(1)),
		testCase(false, 't.fail(\'message\', \'extra argument\');', tooManyError(1)),
		testCase(false, 't.truthy(\'unicorn\', \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.falsy(\'unicorn\', \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.true(true, \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.false(false, \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.is(\'same\', \'same\', \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.not(\'not\', \'same\', \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.deepEqual({}, {}, \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.notDeepEqual({}, {a: true}, \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.throws(Promise.reject(), Error, \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.notThrows(Promise.resolve(), \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.regex(a, /a/, \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.notRegex(a, /a/, \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.ifError(new Error(), \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.skip.is(\'same\', \'same\', \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.is.skip(\'same\', \'same\', \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.snapshot(value, \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.teardown(() => {}, \'extra argument\');', tooManyError(1)),
		testCase(false, 't.timeout(1, \'extra argument\');', tooManyError(1)),

		testCase('always', 't.pass();', missingError),
		testCase('always', 't.fail();', missingError),
		testCase('always', 't.truthy(\'unicorn\');', missingError),
		testCase('always', 't.falsy(\'unicorn\');', missingError),
		testCase('always', 't.true(true);', missingError),
		testCase('always', 't.false(false);', missingError),
		testCase('always', 't.is(\'same\', \'same\');', missingError),
		testCase('always', 't.not(\'not\', \'same\');', missingError),
		testCase('always', 't.deepEqual({}, {});', missingError),
		testCase('always', 't.notDeepEqual({}, {a: true});', missingError),
		testCase('always', 't.throws(Promise.reject());', missingError),
		testCase('always', 't.throws(Promise.reject(), Error);', missingError),
		testCase('always', 't.notThrows(Promise.resolve());', missingError),
		testCase('always', 't.regex(a, /a/);', missingError),
		testCase('always', 't.notRegex(a, /a/);', missingError),
		testCase('always', 't.ifError(new Error());', missingError),
		testCase('always', 't.skip.is(\'same\', \'same\');', missingError),
		testCase('always', 't.is.skip(\'same\', \'same\');', missingError),
		testCase('always', 't.snapshot(value);', missingError),

		testCase('never', 't.pass(\'message\');', foundError),
		testCase('never', 't.fail(\'message\');', foundError),
		testCase('never', 't.truthy(\'unicorn\', \'message\');', foundError),
		testCase('never', 't.falsy(\'unicorn\', \'message\');', foundError),
		testCase('never', 't.true(true, \'message\');', foundError),
		testCase('never', 't.false(false, \'message\');', foundError),
		testCase('never', 't.is(\'same\', \'same\', \'message\');', foundError),
		testCase('never', 't.not(\'not\', \'same\', \'message\');', foundError),
		testCase('never', 't.deepEqual({}, {}, \'message\');', foundError),
		testCase('never', 't.notDeepEqual({}, {a: true}, \'message\');', foundError),
		testCase('never', 't.throws(Promise.reject(), Error, \'message\');', foundError),
		testCase('never', 't.notThrows(Promise.resolve(), \'message\');', foundError),
		testCase('never', 't.regex(a, /a/, \'message\');', foundError),
		testCase('never', 't.notRegex(a, /a/, \'message\');', foundError),
		testCase('never', 't.ifError(new Error(), \'message\');', foundError),
		testCase('never', 't.skip.is(\'same\', \'same\', \'message\');', foundError),
		testCase('never', 't.is.skip(\'same\', \'same\', \'message\');', foundError),
		testCase('never', 't.snapshot(value, \'message\');', foundError),

		testCase(false, 't.end(\'too many\', \'arguments\');', tooManyError(1)),
		testCase(false, 't.skip.end(\'too many\', \'arguments\');', tooManyError(1)),
		testCase(false, 't.end.skip(\'too many\', \'arguments\');', tooManyError(1))
	]
});

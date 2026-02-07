import test from 'ava';
import AvaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/assertion-arguments.js';

const ruleTester = new AvaRuleTester(test, {
	languageOptions: {
		ecmaVersion: 'latest',
	},
});

const missingError = {messageId: 'missing-message'};
const foundError = {messageId: 'found-message'};
const tooFewError = () => ({messageId: 'too-few-arguments'});
const tooManyError = () => ({messageId: 'too-many-arguments'});
const outOfOrderError = (line, column, endLine, endColumn) => ({
	messageId: 'out-of-order',
	line, column, endLine, endColumn,
});
const messageIsNotStringError = {messageId: 'not-string-message'};

const header = 'const test = require(\'ava\');';

function testCode(content, useHeader) {
	const testFunction = `
		test(t => {
			${content}
		});
	`;
	const code = (useHeader === false ? '' : header) + testFunction;
	return code;
}

function offsetError(error, line, column) {
	const offset = {...error};

	if (error.line !== undefined) {
		offset.line += line;
	}

	if (error.column !== undefined && error.line === 1) {
		offset.column += column;
	}

	if (error.endLine !== undefined) {
		offset.endLine += line;
	}

	if (error.endColumn !== undefined && error.endLine === 1) {
		offset.endColumn += column;
	}

	return offset;
}

function testCase(message, content, errors = [], {
	useHeader, output = null,
} = {}) {
	if (!Array.isArray(errors)) {
		errors = [errors];
	}

	const offset = useHeader === false ? [1, 3] : [2, 3];

	errors = errors.map(error => offsetError(error, ...offset));

	const result = {
		options: message ? [{message}] : [],
		code: testCode(content, useHeader),
	};

	if (errors.length > 0) {
		result.errors = errors;
		result.output = output === null ? null : testCode(output, useHeader);
	}

	return result;
}

const statics = [
	'null',
	'true',
	'false',
	'1.0',
	'1n',
	'"string"',
	/* eslint-disable no-template-curly-in-string */
	'`template ${"string"}`',
	/* eslint-enable no-template-curly-in-string */
	String.raw`/.*regex.*\.js/ig`,
	'{}',
	'{a: 1}',
	'{a: {b: 1}}',
	'{"c": 1}',
	'{3: 1}',
	'{["a" + "b"]: {c: 1}}',
	'{...{a: 1}}',
	'[]',
	'[1, 2, {a: 3}]',
	'[...[1, 2, 3]]',
	'void 0',
	'void a',
	'~1',
	'!""',
	'+[]',
	'-"a"',
	'1 + "a"',
	'1 && 0',
	'null ?? false',
	'true ? [] : [1]',
	'true ? [] : a',
	'{a: 1}.a',
	'{a: 1}["a"]',
	'{a: 1}.a["a"]',
	'[1][0]',
	'[[1]][0][0]',
	'{a: 1}?.a?.["b"]',
	'[{a: 1}]?.a?.[0]',
	'a = 1',
];

const dynamics = [
	'NaN',
	'undefined',
	'Infinity',
	'-Infinity',
	'a',
	'a.b',
	'a["b"]',
	'{}[a]',
	'{}.a[a]',
	'[][a]',
	'[[1]][0][a]',
	'(() => {}).a',
	'a()',
	'new A()',
	'class A {}',
	'function a() {}',
	'() => {}',
	'tagged`template string`',
	'new RegExp(\'[dynamic]\')',
	'~a',
	'++a',
	'delete a.b',
	'[delete a.b]',
	'{...a}',
	'{[a]: 1}',
	'{ a() {} }',
	'{ get a() {}}',
	'{ set a(value) {} }',
	'[...a]',
	'a ? [] : [1]',
	'true ? a : [1]',
	'"a"?.()',
	'{a: 1}?.[b]',
];

ruleTester.run('assertion-arguments', rule, {
	assertionOptions: {
		requireMessage: true,
	},
	valid: [
		testCase(false, 't.plan(1);'),
		testCase(false, 't.assert(true, \'message\');'),
		testCase(false, 't.deepEqual({}, {}, \'message\');'),
		testCase(false, 't.fail(\'message\');'),
		testCase(false, 't.false(false, \'message\');'),
		testCase(false, 't.falsy(\'unicorn\', \'message\');'),
		testCase(false, 't.ifError(new Error(), \'message\');'),
		testCase(false, 't.is.skip(\'same\', \'same\', \'message\');'),
		testCase(false, 't.is(\'same\', \'same\', \'message\');'),
		testCase(false, 't.like({}, {}, \'message\');'),
		testCase(false, 't.not(\'not\', \'same\', \'message\');'),
		testCase(false, 't.notDeepEqual({}, {a: true}, \'message\');'),
		testCase(false, 't.notThrows(Promise.resolve(), \'message\');'),
		testCase(false, 't.notThrowsAsync(Promise.resolve(), \'message\');'),
		testCase(false, 't.pass(\'message\');'),
		testCase(false, 't.regex(a, /a/, \'message\');'),
		testCase(false, 't.notRegex(a, /a/, \'message\');'),
		testCase(false, 't.skip.is(\'same\', \'same\', \'message\');'),
		testCase(false, 't.throws(Promise.reject(), Error, \'message\');'),
		testCase(false, 't.throwsAsync(Promise.reject(), Error, \'message\');'),
		testCase(false, 't.true(true, \'message\');'),
		testCase(false, 't.truthy(\'unicorn\', \'message\');'),
		testCase(false, 't.snapshot(value, \'message\');'),
		testCase(false, 't.context.plan();'),
		testCase(false, 't.teardown(() => {});'),
		testCase(false, 't.timeout(100, \'message\');'),
		testCase(false, 'foo.t.plan();'),
		// Shouldn't be triggered since it's not a test file
		testCase(false, 't.true(true);', [], {useHeader: false}),

		testCase(false, 't.assert(true);'),
		testCase(false, 't.deepEqual({}, {});'),
		testCase(false, 't.fail();'),
		testCase(false, 't.false(false);'),
		testCase(false, 't.falsy(\'unicorn\');'),
		testCase(false, 't.ifError(new Error());'),
		testCase(false, 't.is.skip(\'same\', \'same\');'),
		testCase(false, 't.is(\'same\', \'same\');'),
		testCase(false, 't.like({}, {});'),
		testCase(false, 't.not(\'not\', \'same\');'),
		testCase(false, 't.notDeepEqual({}, {a: true});'),
		testCase(false, 't.notThrows(Promise.resolve());'),
		testCase(false, 't.notThrowsAsync(Promise.resolve());'),
		testCase(false, 't.pass();'),
		testCase(false, 't.regex(a, /a/);'),
		testCase(false, 't.notRegex(a, /a/);'),
		testCase(false, 't.skip.is(\'same\', \'same\');'),
		testCase(false, 't.throws(Promise.reject());'),
		testCase(false, 't.throws(Promise.reject(), Error);'),
		testCase(false, 't.throwsAsync(Promise.reject());'),
		testCase(false, 't.throwsAsync(Promise.reject(), Error);'),
		testCase(false, 't.true(true);'),
		testCase(false, 't.truthy(\'unicorn\');'),
		testCase(false, 't.snapshot(value);'),
		// Shouldn't be triggered since it's not a test file
		testCase(false, 't.true(true, \'message\');', [], {useHeader: false}),

		testCase(false, 't.context.a(1, 2, 3, 4);'),
		testCase(false, 't.context.is(1, 2, 3, 4);'),
		testCase(false, 't.foo(1, 2, 3, 4);'),

		testCase('always', 't.plan(1);'),
		testCase('always', 't.assert(true, \'message\');'),
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
		testCase('always', 't.like({}, {}, \'message\');'),
		testCase('always', 't.throws(Promise.reject(), Error, \'message\');'),
		testCase('always', 't.notThrows(Promise.resolve(), \'message\');'),
		testCase('always', 't.throwsAsync(Promise.reject(), Error, \'message\');'),
		testCase('always', 't.notThrowsAsync(Promise.resolve(), \'message\');'),
		testCase('always', 't.regex(a, /a/, \'message\');'),
		testCase('always', 't.notRegex(a, /a/, \'message\');'),
		testCase('always', 't.ifError(new Error(), \'message\');'),
		testCase('always', 't.skip.is(\'same\', \'same\', \'message\');'),
		testCase('always', 't.is.skip(\'same\', \'same\', \'message\');'),
		testCase('always', 't.snapshot(value, \'message\');'),
		testCase('always', 't.teardown(() => {});'),
		testCase('always', 't.timeout(100, \'message\');'),
		testCase('always', 't.try(tt => tt.pass(\'ok\'));'),
		testCase('always', 't.try(tt => tt.pass(\'ok\'), 1, 2);'),
		testCase('always', 't.try(\'title\', tt => tt.pass(\'ok\'), 1, 2);'),

		// Shouldn't be triggered since it's not a test file
		testCase('always', 't.true(true);', [], {useHeader: false}),

		testCase('always', 't.context.a(1, 2, 3, 4);'),
		testCase('always', 't.context.is(1, 2, 3, 4);'),
		testCase('always', 't.foo(1, 2, 3, 4);'),

		testCase('never', 't.plan(1);'),
		testCase('never', 't.assert(true);'),
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
		testCase('never', 't.like({}, {});'),
		testCase('never', 't.throws(Promise.reject());'),
		testCase('never', 't.throws(Promise.reject(), Error);'),
		testCase('never', 't.notThrows(Promise.resolve());'),
		testCase('never', 't.throwsAsync(Promise.reject());'),
		testCase('never', 't.throwsAsync(Promise.reject(), Error);'),
		testCase('never', 't.notThrowsAsync(Promise.resolve());'),
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
		testCase('never', 't.true(true, \'message\');', [], {useHeader: false}),

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
		testCase('never', 't.skip.end(error);'),

		// Assertion argument order
		testCase(false, 't.deepEqual(\'static\', \'static\');'),
		testCase(false, 't.deepEqual(dynamic, \'static\');'),
		testCase(false, 't.deepEqual(dynamic, dynamic);'),
		testCase(false, 't.is(dynamic, \'static\');'),
		testCase(false, 't.like(dynamic, \'static\');'),
		testCase(false, 't.not(dynamic, \'static\');'),
		testCase(false, 't.notDeepEqual(dynamic, \'static\');'),
		testCase(false, 't.throws(() => {}, expected);'),
		testCase(false, 't.throws(() => {}, null, "message");'),
		testCase(false, 't.throwsAsync(async () => {}, {name: \'TypeError\'});'),
		testCase(false, 't.throwsAsync(async () => {}, null, "message");'),
		testCase(false, 't.assert(dynamic === \'static\');'),
		testCase(false, 't.true(dynamic === \'static\');'),
		testCase(false, 't.false(dynamic === \'static\');'),
		testCase(false, 't.truthy(dynamic === \'static\');'),
		testCase(false, 't.falsy(dynamic === \'static\');'),
		// No documented actual/expected distinction for t.regex()
		testCase(false, 't.regex(\'static\', new RegExp(\'[dynamic]+\'));'),
		testCase(false, 't.regex(dynamic, /[static]/);'),
		testCase(false, 't.notRegex(\'static\', new RegExp(\'[dynamic]+\'));'),
		testCase(false, 't.notRegex(dynamic, /[static]/);'),

		// Lookup message type
		testCase(false, 'const message = \'ok\'; t.assert(true, message);'),
		testCase(false, 'const message = \'ok\'; t.is(42, 42, message);'),

		// String concatenation in assertion message
		testCase(false, 't.assert(true, \'abc\' + someString);'),
		testCase(false, 't.assert(true, someString + \'abc\');'),
		testCase(false, 't.is(1, 2, `template` + x);'),
		testCase(false, 't.is(1, 2, (\'a\' + x) + y);'),

		// Should not crash on unresolvable variables (catch params, function params, destructured params, globals)
		testCase(false, 'try {} catch (error) { t.fail(error); }'),
		testCase(false, 'function foo(message) { t.assert(true, message); }'),
		testCase(false, 't.fail(globalVariable);'),
		testCase(false, '[["name", 1, 2]].forEach(([testName, a, b]) => { t.is(a, b, testName); });'),
	],
	invalid: [
		// Not enough arguments
		testCase(false, 't.plan();', tooFewError()),
		testCase(false, 't.assert();', tooFewError()),
		testCase(false, 't.truthy();', tooFewError()),
		testCase(false, 't.falsy();', tooFewError()),
		testCase(false, 't.true();', tooFewError()),
		testCase(false, 't.false();', tooFewError()),
		testCase(false, 't.is(\'same\');', tooFewError()),
		testCase(false, 't.not(\'not\');', tooFewError()),
		testCase(false, 't.deepEqual({});', tooFewError()),
		testCase(false, 't.notDeepEqual({});', tooFewError()),
		testCase(false, 't.like({});', tooFewError()),
		testCase(false, 't.throws();', tooFewError()),
		testCase(false, 't.notThrows();', tooFewError()),
		testCase(false, 't.throwsAsync();', tooFewError()),
		testCase(false, 't.notThrowsAsync();', tooFewError()),
		testCase(false, 't.regex(a);', tooFewError()),
		testCase(false, 't.notRegex(a);', tooFewError()),
		testCase(false, 't.ifError();', tooFewError()),
		testCase(false, 't.skip.is(\'same\');', tooFewError()),
		testCase(false, 't.is.skip(\'same\');', tooFewError()),
		testCase(false, 't.snapshot();', tooFewError()),
		testCase(false, 't.teardown();', tooFewError()),
		testCase(false, 't.timeout();', tooFewError()),
		testCase(false, 't.try();', tooFewError()),

		// Too many arguments
		testCase(false, 't.plan(1, \'extra argument\');', tooManyError()),
		testCase(false, 't.assert(true, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.pass(\'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.fail(\'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.truthy(\'unicorn\', \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.falsy(\'unicorn\', \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.true(true, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.false(false, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.is(\'same\', \'same\', \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.not(\'not\', \'same\', \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.deepEqual({}, {}, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.notDeepEqual({}, {a: true}, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.like({}, {}, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.throws(Promise.reject(), Error, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.notThrows(Promise.resolve(), \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.throwsAsync(Promise.reject(), Error, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.notThrowsAsync(Promise.resolve(), \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.regex(a, /a/, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.notRegex(a, /a/, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.ifError(new Error(), \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.skip.is(\'same\', \'same\', \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.is.skip(\'same\', \'same\', \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.snapshot(value, \'message\', \'extra argument\');', tooManyError()),
		testCase(false, 't.teardown(() => {}, \'extra argument\');', tooManyError()),
		testCase(false, 't.timeout(1, \'message\', \'extra argument\');', tooManyError()),

		testCase('always', 't.assert(true);', missingError),
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
		testCase('always', 't.like({}, {});', missingError),
		testCase('always', 't.throws(Promise.reject());', missingError),
		testCase('always', 't.throws(Promise.reject(), Error);', missingError),
		testCase('always', 't.notThrows(Promise.resolve());', missingError),
		testCase('always', 't.throwsAsync(Promise.reject());', missingError),
		testCase('always', 't.throwsAsync(Promise.reject(), Error);', missingError),
		testCase('always', 't.notThrowsAsync(Promise.resolve());', missingError),
		testCase('always', 't.regex(a, /a/);', missingError),
		testCase('always', 't.notRegex(a, /a/);', missingError),
		testCase('always', 't.ifError(new Error());', missingError),
		testCase('always', 't.skip.is(\'same\', \'same\');', missingError),
		testCase('always', 't.is.skip(\'same\', \'same\');', missingError),
		testCase('always', 't.snapshot(value);', missingError),

		testCase('never', 't.assert(true, \'message\');', foundError),
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
		testCase('never', 't.like({}, {}, \'message\');', foundError),
		testCase('never', 't.throws(Promise.reject(), Error, \'message\');', foundError),
		testCase('never', 't.notThrows(Promise.resolve(), \'message\');', foundError),
		testCase('never', 't.throwsAsync(Promise.reject(), Error, \'message\');', foundError),
		testCase('never', 't.notThrowsAsync(Promise.resolve(), \'message\');', foundError),
		testCase('never', 't.regex(a, /a/, \'message\');', foundError),
		testCase('never', 't.notRegex(a, /a/, \'message\');', foundError),
		testCase('never', 't.ifError(new Error(), \'message\');', foundError),
		testCase('never', 't.skip.is(\'same\', \'same\', \'message\');', foundError),
		testCase('never', 't.is.skip(\'same\', \'same\', \'message\');', foundError),
		testCase('never', 't.snapshot(value, \'message\');', foundError),

		testCase(false, 't.end(\'too many\', \'arguments\');', tooManyError()),
		testCase(false, 't.skip.end(\'too many\', \'arguments\');', tooManyError()),
		testCase(false, 't.end.skip(\'too many\', \'arguments\');', tooManyError()),

		// Assertion argument order
		testCase(false, 't.deepEqual(\'static\', dynamic);', outOfOrderError(1, 13, 1, 30), {output: 't.deepEqual(dynamic, \'static\');'}),
		testCase(false, 't.is(\'static\', dynamic);', outOfOrderError(1, 6, 1, 23), {output: 't.is(dynamic, \'static\');'}),
		testCase(false, 't.like({a: {b: 1}}, dynamic);', outOfOrderError(1, 8, 1, 28), {output: 't.like(dynamic, {a: {b: 1}});'}),
		testCase(false, 't.not(\'static\', dynamic);', outOfOrderError(1, 7, 1, 24), {output: 't.not(dynamic, \'static\');'}),
		testCase(false, 't.notDeepEqual({static: true}, dynamic);', outOfOrderError(1, 16, 1, 39), {output: 't.notDeepEqual(dynamic, {static: true});'}),
		testCase(false, 't.throws({name: \'TypeError\'}, () => {});', outOfOrderError(1, 10, 1, 39), {output: 't.throws(() => {}, {name: \'TypeError\'});'}),
		testCase(false, 't.throwsAsync({name: \'TypeError\'}, async () => {});', outOfOrderError(1, 15, 1, 50), {output: 't.throwsAsync(async () => {}, {name: \'TypeError\'});'}),
		testCase('always', 't.deepEqual({}, actual, \'message\');', outOfOrderError(1, 13, 1, 23), {output: 't.deepEqual(actual, {}, \'message\');'}),
		testCase('never', 't.deepEqual({}, actual);', outOfOrderError(1, 13, 1, 23), {output: 't.deepEqual(actual, {});'}),
		testCase('always', 't.deepEqual({}, actual);', [missingError, outOfOrderError(1, 13, 1, 23)], {output: 't.deepEqual(actual, {});'}),
		testCase('never', 't.deepEqual({}, actual, \'message\');', [foundError, outOfOrderError(1, 13, 1, 23)], {output: 't.deepEqual(actual, {}, \'message\');'}),
		testCase(false, 't.deepEqual({}, actual, extra, \'message\');', tooManyError()),
		testCase(false, 't.deepEqual({}, (actual));', outOfOrderError(1, 13, 1, 25), {output: 't.deepEqual((actual), {});'}),
		testCase(false, 't.deepEqual({}, actual/*: type */);', outOfOrderError(1, 13, 1, 34)),
		testCase(
			false,
			`t.deepEqual(// Line comment 1
				'static' // Line Comment 2
				, // Line Comment 3
				dynamic // Line Comment 4
				// Line Comment 5
			); // Line Comment 6`,
			outOfOrderError(1, 13, 5, 22),
		),
		testCase(false, 't.assert(\'static\' !== dynamic);', outOfOrderError(1, 10, 1, 30), {output: 't.assert(dynamic !== \'static\');'}),
		testCase(false, 't.true(\'static\' <= dynamic);', outOfOrderError(1, 8, 1, 27), {output: 't.true(dynamic >= \'static\');'}),
		testCase(false, 't.false(\'static\' < dynamic);', outOfOrderError(1, 9, 1, 27), {output: 't.false(dynamic > \'static\');'}),
		testCase(false, 't.truthy(\'static\' > dynamic);', outOfOrderError(1, 10, 1, 28), {output: 't.truthy(dynamic < \'static\');'}),
		testCase(false, 't.falsy(\'static\' >= dynamic);', outOfOrderError(1, 9, 1, 28), {output: 't.falsy(dynamic <= \'static\');'}),
		testCase(false, 't.true(\'static\' === actual/*: type */);', outOfOrderError(1, 8, 1, 38)),
		...statics.map(expression =>
			testCase(false, `t.deepEqual(${expression}, dynamic);`, outOfOrderError(1, 13, 1, 22 + expression.length), {output: `t.deepEqual(dynamic, ${expression});`})),
		...dynamics.map(expression =>
			testCase(false, `t.deepEqual('static', ${expression});`, outOfOrderError(1, 13, 1, 23 + expression.length), {output: `t.deepEqual(${expression}, 'static');`})),

		// Message is not string
		testCase(false, 't.assert(true, true);', messageIsNotStringError),
		testCase(false, 't.deepEqual({}, {}, 42);', messageIsNotStringError),
		testCase(false, 't.fail({});', messageIsNotStringError),
		testCase(false, 'let message = "ok"; message = false; t.assert(true, message);', messageIsNotStringError),

		// Alternative test object names for t.try() callbacks
		testCase(false, 'tt.is(\'same\');', tooFewError()),
		testCase(false, 't_.deepEqual({});', tooFewError()),
		testCase(false, 't1.is(\'same\', \'same\', \'message\', \'extra argument\');', tooManyError()),
		testCase('always', 'tt.pass();', missingError),
	],
});

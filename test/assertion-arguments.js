const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/assertion-arguments');

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	},
	parserOptions: {
		ecmaVersion: 2020
	}
});

const missingError = 'Expected an assertion message, but found none.';
const foundError = 'Expected no assertion message, but found one.';
const tooFewError = n => `Not enough arguments. Expected at least ${n}.`;
const tooManyError = n => `Too many arguments. Expected at most ${n}.`;
const outOfOrderError = (line, column, endLine, endColumn) => ({
	message: 'Expected values should come after actual values.',
	line, column, endLine, endColumn
});

const header = 'const test = require(\'ava\');';

function testCode(content, useHeader) {
	const testFn = `
		test(t => {
			${content}
		});
	`;
	const code = (useHeader === false ? '' : header) + testFn;
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
	useHeader, output = null
} = {}) {
	if (!Array.isArray(errors)) {
		errors = [errors];
	}

	const offset = useHeader === false ? [1, 3] : [2, 3];

	errors = errors
		.map(error => typeof error === 'string' ? {message: error} : error)
		.map(error => ({ruleId: 'assertion-arguments', ...error}))
		.map(error => offsetError(error, ...offset));

	return {
		errors,
		options: message ? [{message}] : [],
		code: testCode(content, useHeader),
		output: output === null ? null : testCode(output, useHeader)
	};
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
	'/.*regex.*\\.js/ig',
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
	'a = 1'
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
	'{a: 1}?.[b]'
];

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
		testCase(false, 't.like({}, {}, \'message\');'),
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
		testCase(false, 't.timeout(100, \'message\');'),
		testCase(false, 'foo.t.plan();'),
		// Shouldn't be triggered since it's not a test file
		testCase(false, 't.true(true);', false, {useHeader: false}),

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
		testCase(false, 't.true(true, \'message\');', [], {useHeader: false}),

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
		testCase('always', 't.like({}, {}, \'message\');'),
		testCase('always', 't.throws(Promise.reject(), Error, \'message\');'),
		testCase('always', 't.notThrows(Promise.resolve(), \'message\');'),
		testCase('always', 't.regex(a, /a/, \'message\');'),
		testCase('always', 't.notRegex(a, /a/, \'message\');'),
		testCase('always', 't.ifError(new Error(), \'message\');'),
		testCase('always', 't.skip.is(\'same\', \'same\', \'message\');'),
		testCase('always', 't.is.skip(\'same\', \'same\', \'message\');'),
		testCase('always', 't.snapshot(value, \'message\');'),
		testCase('always', 't.teardown(() => {});'),
		testCase('always', 't.timeout(100, \'message\');'),
		testCase('always', 't.try(tt => tt.pass());'),
		testCase('always', 't.try(tt => tt.pass(), 1, 2);'),
		testCase('always', 't.try(\'title\', tt => tt.pass(), 1, 2);'),

		// Shouldn't be triggered since it's not a test file
		testCase('always', 't.true(true);', [], {useHeader: false}),

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
		testCase('never', 't.like({}, {});'),
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
		testCase(false, 't.notDeepEqual(dynamic, \'static\');'),
		testCase(false, 't.throws(() => {}, expected);'),
		testCase(false, 't.throws(() => {}, null, "message");'),
		// No documented actual/expected distinction for t.regex()
		testCase(false, 't.regex(\'static\', new RegExp(\'[dynamic]+\'));'),
		testCase(false, 't.regex(dynamic, /[static]/);'),
		testCase(false, 't.notRegex(\'static\', new RegExp(\'[dynamic]+\'));'),
		testCase(false, 't.notRegex(dynamic, /[static]/);')
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
		testCase(false, 't.like({});', tooFewError(2)),
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
		testCase(false, 't.like({}, {}, \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.throws(Promise.reject(), Error, \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.notThrows(Promise.resolve(), \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.regex(a, /a/, \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.notRegex(a, /a/, \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.ifError(new Error(), \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.skip.is(\'same\', \'same\', \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.is.skip(\'same\', \'same\', \'message\', \'extra argument\');', tooManyError(3)),
		testCase(false, 't.snapshot(value, \'message\', \'extra argument\');', tooManyError(2)),
		testCase(false, 't.teardown(() => {}, \'extra argument\');', tooManyError(1)),
		testCase(false, 't.timeout(1, \'message\', \'extra argument\');', tooManyError(2)),

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
		testCase('never', 't.like({}, {}, \'message\');', foundError),
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
		testCase(false, 't.end.skip(\'too many\', \'arguments\');', tooManyError(1)),

		// Assertion argument order
		testCase(false, 't.deepEqual(\'static\', dynamic);',
			outOfOrderError(1, 13, 1, 30),
			{output: 't.deepEqual(dynamic, \'static\');'}
		),
		testCase(false, 't.notDeepEqual({static: true}, dynamic);',
			outOfOrderError(1, 16, 1, 39),
			{output: 't.notDeepEqual(dynamic, {static: true});'}
		),
		testCase(false, 't.throws({name: \'TypeError\'}, () => {});',
			outOfOrderError(1, 10, 1, 39),
			{output: 't.throws(() => {}, {name: \'TypeError\'});'}
		),
		testCase('always', 't.deepEqual({}, actual, \'message\');',
			outOfOrderError(1, 13, 1, 23),
			{output: 't.deepEqual(actual, {}, \'message\');'}
		),
		testCase('never', 't.deepEqual({}, actual);',
			outOfOrderError(1, 13, 1, 23),
			{output: 't.deepEqual(actual, {});'}
		),
		...statics.map(expression =>
			testCase(false, `t.deepEqual(${expression}, dynamic);`,
				outOfOrderError(1, 13, 1, 22 + expression.length),
				{output: `t.deepEqual(dynamic, ${expression});`}
			)
		),
		...dynamics.map(expression =>
			testCase(false, `t.deepEqual('static', ${expression});`,
				outOfOrderError(1, 13, 1, 23 + expression.length),
				{output: `t.deepEqual(${expression}, 'static');`}
			)
		)
	]
});

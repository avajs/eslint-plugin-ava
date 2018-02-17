import test from 'ava';
import babelEslint from 'babel-eslint';
import utils from '../rules/utils';

// isValidTestName

function testName(code, expected) {
	test(`isTestName(${code}) === $expected`, t => {
		var node = babelEslint.parse(code).body[0].expression;
		t.is(utils.isValidTestName(node), expected);
	});
}

testName('"string"', 'definitely');
testName('`template`', 'definitely');

testName('callExp()', 'maybe');
testName('this', 'maybe');
testName('identifier', 'maybe');
testName('obj.prop', 'maybe');

test('YieldExpression is "maybe" a valid test name', t => {
	var node = babelEslint.parse('function* foo() {yield b}').body[0].body.body[0].expression;
	t.is(utils.isValidTestName(node), 'maybe');
});

testName('a += "str"', 'definitely');
testName('a = "str"', 'definitely');
testName('a += b', 'maybe');
testName('a = b', 'maybe');

testName('id1 + id2', 'maybe');
testName('id1 + call()', 'maybe');
testName('call() + id2', 'maybe');
testName('call1() + call2()', 'maybe');
testName('"str" + call2()', 'definitely');
testName('id1 + "str"', 'definitely');
testName('"foo" - "foo"', false);
testName('3 + 4', false);

testName('condition ? id1 : id2', 'maybe');
testName('condition ? id1 : "string2"', 'maybe');
testName('condition ? "string1" : "string2"', 'definitely');
testName('condition ? 1 : "string2"', false);

testName('a || b', 'maybe');
testName('"a" || "b"', 'definitely');
testName('a || "b"', 'maybe');
testName('a && b', false);

// isValidTestFunction

function testFn(code, expected) {
	test(`isTestFunction(${code}) === $expected`, t => {
		var node = babelEslint.parse('(' + code + ')').body[0].expression;
		t.is(utils.isValidTestFunction(node), expected);
	});
}

testFn('function () {}', 'definitely');
testFn('function foo() {}', 'definitely');
testFn('() => {}', 'definitely');

testFn('this', 'maybe');
testFn('id', 'maybe');
testFn('obj.prop', 'maybe');
testFn('foo()', 'maybe');

testFn('3', false);

test('YieldExpression is "maybe" a valid test function', t => {
	var node = babelEslint.parse('function* foo() {yield b}').body[0].body.body[0].expression;
	t.is(utils.isValidTestFunction(node), 'maybe');
});

testFn('a = function () {}', 'definitely');
testFn('a = () => {}', 'definitely');

testFn('condition ? a : b', 'maybe');
testFn('condition ? () => {} : b', 'maybe');
testFn('condition ? () => {} : () => {}', 'definitely');
testFn('condition ? 3 : () => {}', false);

testFn('(() => {}) || (() => {})', 'definitely');
testFn('a || (t => {})', 'maybe');
testFn('a || function () {}', 'maybe');
testFn('a || 3', false);

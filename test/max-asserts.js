import test from 'ava';
import avaRuleTester from 'eslint-ava-rule-tester';
import rule from '../rules/max-asserts';
import testCaseBuilder from './helpers/test-case';

const ruleTester = avaRuleTester(test, {
	env: {
		es6: true
	}
});

const ruleId = 'max-asserts';
const testCase = testCaseBuilder(ruleId);
const lowAssertsCount = 2;
const lowerTestCase = testCaseBuilder(ruleId, lowAssertsCount);
const errorMessage = (expected, found) => `Expected at most ${expected} assertions, but found ${found}.`;

function nbAssertions(n) {
	return Array.from({length: n}).map(() => 't.is(1, 1);').join('\n');
}

ruleTester.run('max-asserts', rule, {
	valid: [
		testCase(nbAssertions(3)),
		testCase(`
			test('1', t => { ${nbAssertions(3)} });
			test('2', t => { ${nbAssertions(3)} });
		`, {wrapInTest: false}),
		testCase(`t.plan(5); ${nbAssertions(5)}`),
		testCase(`t.is.skip(1, 1); ${nbAssertions(4)}`),
		testCase(`test.cb('main', t => { ${nbAssertions(5)} t.end(); });`, {wrapInTest: false}),
		testCase(`t.context.bar(); ${nbAssertions(5)}`),
		testCase('t.context.is(1, 1); '.repeat(6)),
		testCase('foo.t.is(1, 1); '.repeat(6)),
		// Shouldn't be triggered since it's not a test file
		testCase(nbAssertions(10), {useHeader: false}),

		lowerTestCase(nbAssertions(2)),
		lowerTestCase('notT.is(1, 1);'.repeat(3))
	],
	invalid: [
		testCase(nbAssertions(6), {errorMessage: errorMessage(5, 6)}),
		testCase(nbAssertions(10), {errorMessage: errorMessage(5, 10)}),
		testCase(`
			test(t => { ${nbAssertions(3)} });
			test(t => { ${nbAssertions(6)} });
		`, {errorMessage: errorMessage(5, 6), wrapInTest: false}),
		testCase(`t.plan(5); ${nbAssertions(6)}`, {errorMessage: errorMessage(5, 6)}),
		testCase(`t.skip.is(1, 1); ${nbAssertions(5)}`, {errorMessage: errorMessage(5, 6)}),
		testCase(`test.cb('main', t => { ${nbAssertions(6)} t.end(); });`, {
			errorMessage: errorMessage(5, 6),
			wrapInTest: false
		}),

		lowerTestCase(nbAssertions(3), {errorMessage: errorMessage(2, 3)}),

		testCase(`
			test('1', t => { ${nbAssertions(6)} });
			test('2', t => { ${nbAssertions(10)} });
		`, {
			errorMessage: [
				errorMessage(5, 6),
				errorMessage(5, 10) // Should have two errors, one per test
			],
			wrapInTest: false
		})
	]
});

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
const basicTestCase = testCaseBuilder(ruleId);
const lowerTestCase = testCaseBuilder(ruleId, [2]);
const errorMessage = (expected, found) => `Expected at most ${expected} assertions, but found ${found}.`;

function nbAssertions(n) {
	return Array.from({length: n}).map(() => 't.is(1, 1);').join('\n');
}

ruleTester.run('max-asserts', rule, {
	valid: [
		basicTestCase(`test(t => { ${nbAssertions(3)} });`),
		basicTestCase(`
			test(t => { ${nbAssertions(3)} });
			test(t => { ${nbAssertions(3)} });
		`),
		basicTestCase(`test(t => { t.plan(5); ${nbAssertions(5)} });`),
		basicTestCase(`test(t => { t.is.skip(1, 1); ${nbAssertions(4)} });`),
		basicTestCase(`test.cb(t => { ${nbAssertions(5)} t.end(); });`),
		basicTestCase(`test(t => { t.context.bar(); ${nbAssertions(5)} });`),
		basicTestCase(`test(t => { ${'t.context.is(1, 1); '.repeat(6)}});`),
		basicTestCase(`test(t => { ${'foo.t.is(1, 1); '.repeat(6)}});`),
		// Shouldn't be triggered since it's not a test file
		basicTestCase(`test(t => { ${nbAssertions(10)} });`, undefined, true),

		lowerTestCase(`test(t => { ${nbAssertions(2)} });`),
		lowerTestCase(`test(t => { notT.is(1, 1); notT.is(1, 1); notT.is(1, 1); });`)
	],
	invalid: [
		basicTestCase(`test(t => { ${nbAssertions(6)} });`, errorMessage(5, 6)),
		basicTestCase(`test(t => { ${nbAssertions(10)} });`, errorMessage(5, 10)),
		basicTestCase(`
			test(t => { ${nbAssertions(3)} });
			test(t => { ${nbAssertions(6)} });
		`, errorMessage(5, 6)),
		basicTestCase(`test(t => { t.plan(5); ${nbAssertions(6)} });`, errorMessage(5, 6)),
		basicTestCase(`test(t => { t.skip.is(1, 1); ${nbAssertions(5)} });`, errorMessage(5, 6)),
		basicTestCase(`test.cb(t => { ${nbAssertions(6)} t.end(); });`, errorMessage(5, 6)),
		basicTestCase(`test.cb(t => { ${nbAssertions(6)} t.end(); });`, errorMessage(5, 6)),

		lowerTestCase(`test(t => { ${nbAssertions(3)} });`, errorMessage(2, 3)),

		basicTestCase(`
			test(t => { ${nbAssertions(6)} });
			test(t => { ${nbAssertions(10)} });
		`, [
			errorMessage(5, 6),
			errorMessage(5, 10) // Should have two errors, one per test
		])
	]
});

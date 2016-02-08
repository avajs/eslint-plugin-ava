import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/prefer-power-assert';

const ruleTester = new RuleTester({
	env: {
		es6: true
	},
	ecmaFeatures: {
		modules: true
	}
});

const errors = [{ruleId: 'prefer-power-assert'}];
const requireHeader = `const test = require('ava');\n`;
const moduleHeader = `import test from 'ava';\n`;

/* eslint no-loop-func: 1 */
for (let header of [requireHeader, moduleHeader]) {
	const validCase = (assertion) => {
		return `${header} test(t => { ${assertion}; });`;
	};
	const invalidCase = (assertion) => {
		return {
			code: `${header} test(t => { ${assertion}; });`,
			errors
		};
	};
	test(`with header ${header}`, () => {
		ruleTester.run('prefer-power-assert', rule, {
			valid: [
				validCase('t.ok(foo)'),
				validCase('t.same(foo, bar)'),
				validCase('t.notSame(foo, bar)'),
				validCase('t.throws(block)'),
				validCase('t.notThrows(block)'),
				validCase('t.skip.ok(foo)'),
				validCase('t.skip.same(foo, bar)'),
				validCase('t.skip.notSame(foo, bar)'),
				validCase('t.skip.throws(block)'),
				validCase('t.skip.notThrows(block)'),
				header + 'test.cb(function (t) { t.ok(foo); t.end(); });',
				// shouldn't be triggered since it's not a test file
				'test(t => {});'
			],
			invalid: [
				invalidCase('t.notOk(foo)'),
				invalidCase('t.true(foo)'),
				invalidCase('t.false(foo)'),
				invalidCase('t.is(foo, bar)'),
				invalidCase('t.not(foo, bar)'),
				invalidCase('t.regex(str, re)'),
				invalidCase('t.ifError(err)'),
				invalidCase('t.skip.notOk(foo)'),
				invalidCase('t.skip.true(foo)'),
				invalidCase('t.skip.false(foo)'),
				invalidCase('t.skip.is(foo, bar)'),
				invalidCase('t.skip.not(foo, bar)'),
				invalidCase('t.skip.regex(str, re)'),
				invalidCase('t.skip.ifError(err)')
			]
		});
	});
}

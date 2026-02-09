import RuleTester from './helpers/rule-tester.js';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/require-assertion.js';

const ruleTester = new RuleTester();
const typescriptRuleTester = new RuleTester({
	languageOptions: {
		parser: tsParser,
	},
});

const error = {
	messageId: 'require-assertion',
};

const invalid = code => ({
	code,
	errors: [error],
});

ruleTester.run('require-assertion', rule, {
	valid: [
		// Has assertion
		'test(t => { t.is(1, 1); });',
		'test(t => { t.pass(); });',
		'test(t => { t.true(true); });',
		'test(t => { t.snapshot(value); });',
		'test(t => { t.throws(() => {}); });',
		'test(async t => { await t.throwsAsync(fn); });',
		'test(t => { t.fail(); });',
		'test(t => { t.assert(value); });',
		'test(t => { t.deepEqual(a, b); });',
		// `t.plan` counts as assertion
		'test(t => { t.plan(1); });',
		// `t.try` counts as assertion
		'test(t => { t.try(tt => { tt.is(1, 1); }); });',
		// Skipped assertion still counts
		'test(t => { t.is.skip(1, 1); });',
		// Alternate skip prefix form
		'test(t => { t.skip.is(1, 1); });',
		// Passing `t` to a function counts (assertions may happen there)
		'test(t => { helper(t); });',
		'test(t => { lib.verify(t, value); });',
		// Assertion via closure is detected
		'test(t => { function helper() { t.is(1, 1); } helper(); });',
		// `test.serial` with assertion
		'test.serial("name", t => { t.is(1, 1); });',
		// `test.failing` with assertion
		'test.failing(t => { t.fail(); });',
		// Hooks don't require assertions
		'test.before(t => { /* setup */ });',
		'test.beforeEach(t => { /* setup */ });',
		'test.after(t => { /* cleanup */ });',
		'test.afterEach(t => { /* cleanup */ });',
		'test.after.always(t => { /* cleanup */ });',
		'test.afterEach.always(t => { /* cleanup */ });',
		// `test.todo` doesn't require assertions
		'test.todo("not yet implemented");',
		// Macro invocation: assertion may be inside macro body
		'test("name", macro, value);',
		// Serial macro invocation
		'test.serial("name", macro, value);',
		// External implementation reference may assert internally
		'test("name", implementation);',
		// External implementation reference without title
		'test(implementation);',
		// External implementation with identifier title may assert internally
		'const title = "name"; test(title, implementation);',
		// Macro invocation with function-valued macro data
		'const macro = (t, callback) => { t.true(callback()); }; test(macro, () => true);',
		// Imported macro with function-valued macro data
		'import macro from "./macro.js"; test(macro, () => true);',
		// Named imported macro with function-valued macro data
		'import {macro as importedMacro} from "./macro.js"; test(importedMacro, () => true);',
		// Namespace imported macro with function-valued macro data
		'import * as macros from "./macro.js"; test(macros.macro, () => true);',
		// Inline macro implementation with function-valued macro data
		'test((t, callback) => { t.true(callback()); }, () => true);',
		// Not a test file
		{code: 'test(t => { doSomething(); });', noHeader: true},
	],
	invalid: [
		// No assertions
		invalid('test(t => { doSomething(); });'),
		// Named test, no assertions
		invalid('test("name", t => { const x = 1; });'),
		// Identifier title still requires assertions when implementation is inline
		invalid('const title = "name"; test(title, t => { doSomething(); });'),
		// Dynamic title expression still requires assertions when implementation is inline
		invalid('const title = getTitle(); test(title, t => { doSomething(); });'),
		// `t.log` is not an assertion
		invalid('test(t => { t.log("debug"); });'),
		// `t.context` is not an assertion
		invalid('test(t => { t.context.foo = 1; });'),
		// `t.teardown` is not an assertion
		invalid('test(t => { t.teardown(() => {}); });'),
		// `t.timeout` is not an assertion
		invalid('test(t => { t.timeout(5000); });'),
		// Empty test body
		invalid('test(t => {});'),
		// `test.serial` still requires assertions
		invalid('test.serial(t => { doSomething(); });'),
		// `test.failing` still requires assertions
		invalid('test.failing(t => {});'),
		// `test.only` still requires assertions
		invalid('test.only(t => { doSomething(); });'),
		// Async test without assertions
		invalid('test(async t => { await doSomething(); });'),
		// Passing a non-test local like `t1` should not count as assertion
		invalid('test(t => { const t1 = 1; helper(t1); });'),
		// Passing a shadowed `t` should not count as passing the test object
		invalid('test(t => { { const t = 1; helper(t); } });'),
		// Calling assertion-like methods on local `t1` should not count
		invalid('test(t => { const t1 = {is() {}}; t1.is(1, 1); });'),
		// Calling assertion-like methods on shadowed `t` should not count
		invalid('test(t => { { const t = {is() {}}; t.is(1, 1); } });'),
		// Multiple tests: one valid, one invalid (verifies counter reset)
		invalid('test(t => { t.is(1, 1); }); test(t => { doSomething(); });'),
	],
});

typescriptRuleTester.run('require-assertion', rule, {
	valid: [
		'test((t => { t.pass(); }) as any);',
		'test(((t => { t.pass(); }) satisfies ((value: unknown) => unknown)));',
		'test(t => { (t as any).pass(); });',
		'test(t => { helper(t as ExecutionContext); });',
		'test(t => { (t!).plan(1); });',
	],
	invalid: [
		invalid('test((t => { doSomething(); }) as any);'),
		invalid('test(((t => { doSomething(); }) satisfies ((value: unknown) => unknown)));'),
		invalid('test((t => { doSomething(); })!);'),
	],
});

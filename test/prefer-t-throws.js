'use strict';

const test = require('ava');
const avaRuleTester = require('eslint-ava-rule-tester');
const rule = require('../rules/prefer-t-throws');

const ruleTester = avaRuleTester(test, {
	parserOptions: {
		ecmaVersion: 'latest',
	},
});

const header = 'const test = require(\'ava\');\n';

ruleTester.run('prefer-t-throws', rule, {
	valid: [
		`${header}test(async t => { const error = await t.throwsAsync(promise); t.is(error, 'error'); });`,
		`${header}test(t => { const error = t.throws(fn()); t.is(error, 'error'); });`,
		`${header}test(async t => { try { t.fail(); unicorn(); } catch (error) { t.is(error, 'error'); } });`,
		`${header}test(async t => { try { await promise; } catch (error) { t.is(error, 'error'); } });`,
	],
	invalid: [
		{
			code: `${header}test(async t => { try { async function unicorn() { throw await Promise.resolve('error') }; unicorn(); t.fail(); } catch (error) { t.is(error, 'error'); } });`,
			errors: [{message: 'Prefer using the `t.throws()` assertion.'}],
		},
		{
			code: `${header}test(async t => { try { await Promise.reject('error'); t.fail(); } catch (error) { t.is(error, 'error'); } });`,
			errors: [{message: 'Prefer using the `t.throwsAsync()` assertion.'}],
		},
		{
			code: `${header}test(async t => { try { if (await promise); t.fail(); } catch (error) { t.is(error, 'error'); } });`,
			errors: [{message: 'Prefer using the `t.throwsAsync()` assertion.'}],
		},
		{
			code: `${header}test(async t => { try { (await 1) > 2; t.fail(); } catch (error) { t.is(error, 'error'); } });`,
			errors: [{message: 'Prefer using the `t.throwsAsync()` assertion.'}],
		},
		{
			code: `${header}test(async t => { try { (await getArray())[0]; t.fail(); } catch (error) { t.is(error, 'error'); } });`,
			errors: [{message: 'Prefer using the `t.throwsAsync()` assertion.'}],
		},
		{
			code: `${header}test(async t => { try { getArraySync(await 20)[0]; t.fail(); } catch (error) { t.is(error, 'error'); } });`,
			errors: [{message: 'Prefer using the `t.throwsAsync()` assertion.'}],
		},
		{
			code: `${header}test(async t => { try { getArraySync()[await 0]; t.fail(); } catch (error) { t.is(error, 'error'); } });`,
			errors: [{message: 'Prefer using the `t.throwsAsync()` assertion.'}],
		},
		{
			code: `${header}test(async t => { try { new (await cl())(1); t.fail(); } catch (error) { t.is(error, 'error'); } });`,
			errors: [{message: 'Prefer using the `t.throwsAsync()` assertion.'}],
		},
		{
			code: `${header}test(async t => { try { if (false) { await promise; }; t.fail(); } catch (error) { t.is(error, 'error'); } });`,
			errors: [{message: 'Prefer using the `t.throwsAsync()` assertion.'}],
		},
		{
			code: `${header}test(t => { try { undefined(); t.fail(); } catch (error) { t.ok(error instanceof TypeError); } });`,
			errors: [{message: 'Prefer using the `t.throws()` assertion.'}],
		},
		{
			code: `${header}test(async t => { try { undefined(); t.fail(); } catch (error) { t.ok(error instanceof TypeError); } });`,
			errors: [{message: 'Prefer using the `t.throws()` assertion.'}],
		},
	],
});
